/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import createStellarIdenticon from 'stellar-identicon-js';
import { formatDate, ROW_HEIGHT, SCROLL_WIDTH, TABLE_MAX_HEIGHT } from '../../Activity/Activity';
import Driver from '../../../../../lib/Driver';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import Printify from '../../../../../lib/Printify';
import images from '../../../../../images';
import { getNextClaimTime } from '../../../../../lib/claimableBalancesHelpers';


export default class ActivePendingPaymentsHistory extends React.Component {
    static async goToStellarExpert(event, transactions, isTestnet) {
        event.stopPropagation();
        const { records } = await transactions();
        window.open(`https://stellar.expert/explorer/${isTestnet ? 'testnet' : 'public'}/tx/${records[0].hash}`, '_blank');
    }

    componentDidMount() {
        this.props.d.claimableBalances.getClaimableBalances();

        this.unsub = this.props.d.claimableBalances.event.sub(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.unsub();
    }

    getPendingPaymentsHistoryRow(historyItem, key, style, isTestnet, account_id) {
        const { amount, asset, sponsor, last_modified_time, transactions, claimants } = historyItem;

        const destination = claimants.find(claimant => claimant.destination === account_id);

        const { status } = getNextClaimTime(destination.predicate, Date.now());

        const { time, date } = formatDate(last_modified_time);

        const canvas = createStellarIdenticon(sponsor);

        const renderedIcon = canvas.toDataURL();

        const viewAddress = sponsor && `${sponsor.substr(0, 18)}...${sponsor.substr(-12, 12)}`;

        const assetCode = asset === 'native' ? 'XLM' : asset.split(':')[0];
        const assetIssuer = asset === 'native' ? null : asset.split(':')[1];

        return (
            <div
                key={key}
                style={style}
                className="Activity-table-row Activity-table-row--clickable"
                onClick={() => {
                    this.props.d.modal.handlers.activate('ClaimableBalanceDetails', historyItem);
                }}
            >
                <div className="Activity-table-cell">{date} {time}</div>
                <div className="Activity-table-cell flex3">{status}</div>
                <div className="Activity-table-cell flex8">
                    <div className="Activity-table-identicon">
                        <img src={renderedIcon} alt="id" />
                    </div>
                    {viewAddress}
                </div>
                <div className="Activity-table-cell">
                    <AssetCardInRow d={this.props.d} code={assetCode} issuer={assetIssuer} />
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex3">
                    {Printify.lightenZeros(amount || '')}
                </div>
                <div className="Activity-table-cell Activity-table_actions flex1">
                    <img
                        title="StellarExpert"
                        src={images['icon-info']}
                        alt="i"
                        onClick={e => { this.constructor.goToStellarExpert(e, transactions, isTestnet).then(); }}
                    />
                </div>
            </div>
        );
    }

    render() {
        const { d } = this.props;
        const { loading, pendingClaimableBalances, accountId } = d.claimableBalances;

        if (pendingClaimableBalances.length === 0 && !loading) {
            return (
                <div className="Activity_empty">
                    You have no pending payments available to claim at the moment.
                </div>
            );
        }

        const listHeight = ROW_HEIGHT * pendingClaimableBalances.length;
        const maxHeight = Math.min(listHeight, TABLE_MAX_HEIGHT);
        const withScroll = listHeight > TABLE_MAX_HEIGHT;

        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>
                        Claim these payments to receive tokens
                        {loading &&
                        <span className="nk-spinner-small-black">
                            <div className="nk-spinner" />
                        </span>}
                    </span>
                </div>
                <div className="Activity-table">
                    <div className="Activity-table-row head" style={{ marginRight: withScroll ? SCROLL_WIDTH : 0 }}>
                        <div className="Activity-table-cell">Date/Time</div>
                        <div className="Activity-table-cell flex3">Status</div>
                        <div className="Activity-table-cell flex8">Address</div>
                        <div className="Activity-table-cell">Asset</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Amount</div>
                        <div className="Activity-table-cell Activity-table_actions flex1" />
                    </div>
                    <div style={{ height: maxHeight }} className="Activity-table-body">
                        <AutoSizer>
                            {({ height, width }) => (
                                <InfiniteLoader
                                    isRowLoaded={() => {}}
                                    rowCount={pendingClaimableBalances.length}
                                    loadMoreRows={e => {
                                        if (e.stopIndex + 40 > pendingClaimableBalances.length) {
                                            d.claimableBalances.loadMore();
                                        }
                                    }}
                                >
                                    {({ onRowsRendered, registerChild }) => (
                                        <List
                                            width={width}
                                            height={height}
                                            onRowsRendered={onRowsRendered}
                                            ref={registerChild}
                                            rowHeight={ROW_HEIGHT}
                                            rowCount={pendingClaimableBalances.length}
                                            rowRenderer={
                                                ({ key, index, style }) =>
                                                    this.getPendingPaymentsHistoryRow(
                                                        pendingClaimableBalances[index],
                                                        key,
                                                        style,
                                                        d.Server.isTestnet,
                                                        accountId,
                                                    )}
                                        />
                                    )}
                                </InfiniteLoader>
                            )}
                        </AutoSizer>
                    </div>
                </div>
            </div>
        );
    }
}
ActivePendingPaymentsHistory.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
