/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { List, AutoSizer } from 'react-virtualized';
import Driver from '../../../../../lib/Driver';
import Ellipsis from '../../../../Common/Ellipsis/Ellipsis';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import images from '../../../../../images';


export default class ActivityPaymentsHistory extends React.Component {
    getPaymentsHistoryRow(historyItem, key, style) {
        const { account_id } = this.props.d.session.account;
        const { allHistory } = this.props;
        const { account, funder, created_at, starting_balance,
            amount, to, from, asset_code, asset_issuer, transaction_hash, type, paging_token } = historyItem;

        const date = new Date(created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const time = new Date(created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        let opType;
        let address;

        switch (type) {
        case 'create_account': {
            opType = (account === account_id) ? 'Account created by' : 'Account created';
            address = (account === account_id) ? funder : account;
            break;
        }
        case 'account_merge': {
            opType = 'Account merged';
            address = account;
            break;
        }
        case 'payment': {
            opType = (to === account_id) ?
                    <span className="green">Receive from</span> :
                    <span className="red">Send to</span>;
            address = (to === account_id) ? from : to;
            break;
        }
        default: break;

        }

        const viewAddress = address && `${address.substr(0, 24)}...${address.substr(-12, 12)}`;

        const asset = asset_issuer ? new StellarSdk.Asset(asset_code, asset_issuer) : new StellarSdk.Asset.native();

        const viewAmount = amount || starting_balance
            || allHistory.find(item => item.paging_token.indexOf(paging_token) === 0).amount;

        return (
            <div key={key} style={style} className="Activity-table-row">
                <div className="Activity-table-cell">{date} at {time}</div>
                <div className="Activity-table-cell">{opType}</div>
                <div className="Activity-table-cell flex9">{viewAddress}</div>
                <div className="Activity-table-cell">
                    <AssetCardInRow d={this.props.d} code={asset.code} issuer={asset.issuer} />
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex2">{viewAmount}</div>
                <div className="Activity-table_actions Activity-table-cell flex1">
                    <a
                        href={`https://stellar.expert/explorer/public/tx/${transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer">
                            <img title="stellar.expert" src={images['icon-info']} alt="i" />
                    </a>
                </div>
            </div>
        );
    }

    render() {
        const { history, loading } = this.props;

        const ROW_HEIGHT = 47;
        const ListHeight = ROW_HEIGHT * history.length;

        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>Payments history({history.length}{loading && <Ellipsis />})</span>
                </div>
                <div className="Activity-table">
                    <div className="Activity-table-row head">
                        <div className="Activity-table-cell">Date/Time</div>
                        <div className="Activity-table-cell">Type</div>
                        <div className="Activity-table-cell flex9">Address</div>
                        <div className="Activity-table-cell">Asset</div>
                        <div className="Activity-table_item_right Activity-table-cell flex2">Amount</div>
                        <div className="Activity-table-cell Activity-table_actions flex1" />
                    </div>
                    <div style={{ height: ListHeight }} className="Activity-table-body">
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    width={width}
                                    height={height}
                                    rowHeight={ROW_HEIGHT}
                                    rowCount={history.length}
                                    rowRenderer={
                                        ({ key, index, style }) =>
                                            this.getPaymentsHistoryRow(history[index], key, style)} />
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
};
