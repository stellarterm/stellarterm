/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import { List, AutoSizer, InfiniteLoader } from 'react-virtualized';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../../../lib/Driver';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import images from '../../../../../images';
import { formatDate, ROW_HEIGHT, SCROLL_WIDTH, TABLE_MAX_HEIGHT } from './../Activity';
import Printify from '../../../../../lib/Printify';

const PAYMENTS_TYPES = ['create_account', 'account_merge', 'payment'];

export default class ActivityPaymentsHistory extends React.Component {
    static filterPaymentsHistory(history) {
        return history.filter(item => (PAYMENTS_TYPES.includes(item.type)));
    }

    static getOperationTypeAndAddress(type, account, account_id, funder, from, to) {
        switch (type) {
        case 'create_account':
            return ({
                opType: (account === account_id) ? 'Created by' : 'Created',
                address: (account === account_id) ? funder : account,
            });
        case 'account_merge': return ({
            opType: 'Account merged',
            address: account,
        });
        case 'payment': return ({
            opType: (to === account_id) ?
                <span>Receive</span> :
                <span>Send</span>,
            address: (to === account_id) ? from : to,
        });
        default: break;
        }
        return null;
    }

    componentDidUpdate(prevProps) {
        const prevHistory = this.constructor.filterPaymentsHistory(prevProps.history);
        const currentHistory = this.constructor.filterPaymentsHistory(this.props.history);
        if ((currentHistory.length !== 0) && (prevHistory.length === currentHistory.length)) {
            this.props.loadMore();
        }
    }

    getPaymentsHistoryRow(historyItem, key, style) {
        const { account_id } = this.props.d.session.account;
        const { allHistory } = this.props;
        const { account, funder, created_at, starting_balance,
            amount, to, from, asset_code, asset_issuer, transaction_hash, type, paging_token } = historyItem;

        const { time, date } = formatDate(created_at);
        const { opType, address } =
            this.constructor.getOperationTypeAndAddress(type, account, account_id, funder, from, to);
        const canvas = createStellarIdenticon(address);
        const renderedIcon = canvas.toDataURL();
        const viewAddress = address && `${address.substr(0, 18)}...${address.substr(-12, 12)}`;

        const asset = asset_issuer ? new StellarSdk.Asset(asset_code, asset_issuer) : new StellarSdk.Asset.native();

        const viewAmount = amount || starting_balance
            || allHistory.find(item => item.paging_token.indexOf(paging_token) === 0).amount;

        return (
            <div key={key} style={style} className="Activity-table-row">
                <div className="Activity-table-cell">{date} {time}</div>
                <div className="Activity-table-cell flex2">{opType}</div>
                <div className="Activity-table-cell flex8">
                    <div className="Activity-table-identicon">
                        <img src={renderedIcon} alt="id" />
                    </div>
                    {viewAddress}
                </div>
                <div className="Activity-table-cell">
                    <AssetCardInRow d={this.props.d} code={asset.code} issuer={asset.issuer} />
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex3">
                    {Printify.lightenZeros(viewAmount)}
                </div>
                <div className="Activity-table_actions Activity-table-cell flex1">
                    <a
                        href={`https://stellar.expert/explorer/public/tx/${transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        <img title="StellarExpert" src={images['icon-info']} alt="i" />
                    </a>
                </div>
            </div>
        );
    }


    render() {
        const { history, loading } = this.props;
        const paymentHistory = this.constructor.filterPaymentsHistory(history);

        const listHeight = ROW_HEIGHT * paymentHistory.length;
        const maxHeight = Math.min(listHeight, TABLE_MAX_HEIGHT);
        const withScroll = listHeight > TABLE_MAX_HEIGHT;

        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>
                        Payments history
                        {loading &&
                            <span className="nk-spinner-small-black">
                                <div className="nk-spinner" />
                            </span>}
                    </span>
                </div>
                <div className="Activity-table">
                    <div className="Activity-table-row head" style={{ marginRight: withScroll ? SCROLL_WIDTH : 0 }}>
                        <div className="Activity-table-cell">Date/Time</div>
                        <div className="Activity-table-cell flex2">Type</div>
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
                                    rowCount={paymentHistory.length}
                                    loadMoreRows={(e) => {
                                        if (e.stopIndex + 40 > paymentHistory.length) {
                                            this.props.loadMore();
                                        }
                                    }}>
                                    {({ onRowsRendered, registerChild }) => (
                                        <List
                                            width={width}
                                            height={height}
                                            onRowsRendered={onRowsRendered}
                                            ref={registerChild}
                                            rowHeight={ROW_HEIGHT}
                                            rowCount={paymentHistory.length}
                                            rowRenderer={
                                                ({ key, index, style }) =>
                                                    this.getPaymentsHistoryRow(paymentHistory[index], key, style)} />
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
ActivityPaymentsHistory.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    allHistory: PropTypes.arrayOf(PropTypes.any),
    history: PropTypes.arrayOf(PropTypes.any),
    loading: PropTypes.bool,
    loadMore: PropTypes.func,
};
