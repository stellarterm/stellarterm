/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { List, AutoSizer } from 'react-virtualized';
import BigNumber from 'bignumber.js';
import Ellipsis from '../../../../Common/Ellipsis/Ellipsis';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import Driver from '../../../../../lib/Driver';
import images from '../../../../../images';


export default class ActivityTradesHistory extends React.Component {
    static async goToStellarExpert(operation) {
        const op = await operation();
        window.open(`https://stellar.expert/explorer/public/tx/${op.transaction_hash}`, '_blank');
    }

    getTradeHistoryRow(historyItem, key, style) {
        const { d } = this.props;
        const { bought_asset_issuer, bought_asset_code, sold_asset_issuer, sold_asset_code,
            sold_amount, bought_amount, operation, created_at } = historyItem;

        const counter = bought_asset_issuer ?
            new StellarSdk.Asset(bought_asset_code, bought_asset_issuer) :
            new StellarSdk.Asset.native();

        const base = sold_asset_issuer ?
            new StellarSdk.Asset(sold_asset_code, sold_asset_issuer) :
            new StellarSdk.Asset.native();


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


        const price = new BigNumber(bought_amount).dividedBy(sold_amount).toFixed(7);
        const priceRevert = new BigNumber(sold_amount).dividedBy(bought_amount).toFixed(7);

        const isBuy = !counter.isNative();

        return (
            <div key={key} style={style} className="Activity-table-row">
                <div className="Activity-table-cell flex5">{date} at {time}</div>
                <div className="Activity-table-cell flex2">
                    <span className={isBuy ? 'green' : 'red'}>{isBuy ? 'Buy' : 'Sell'}</span>
                </div>
                <div className="Activity-table-cell">
                    <AssetCardInRow d={d} code={base.code} issuer={base.issuer} />
                </div>
                <div className="Activity-table-cell">
                    <AssetCardInRow d={d} code={counter.code} issuer={counter.issuer} />
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex3">
                    {isBuy ? bought_amount : sold_amount}
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex3">
                    {isBuy ? priceRevert : price}
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex3">
                    {isBuy ? sold_amount : bought_amount}
                </div>
                <div className="Activity-table_actions Activity-table-cell flex1">
                    <img
                        title="stellar.expert"
                        src={images['icon-info']}
                        alt="i"
                        onClick={() => { this.constructor.goToStellarExpert(operation); }} />
                </div>
            </div>
        );
    }

    render() {
        const { history, loading } = this.props;

        const tradeHistory = history.filter(item => (
            item.type === 'trade' && item.base_amount !== '0.0000000'
        ));

        if (!loading && tradeHistory.length === 0) {
            return (
                <div className="Activity_empty">You have no trade history</div>
            );
        }

        const ROW_HEIGHT = 47;
        const ListHeight = ROW_HEIGHT * tradeHistory.length;


        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>Trading history({tradeHistory.length}{loading && <Ellipsis />})</span>
                </div>
                <div className="Activity-table">
                    <div className="Activity-table-row head">
                        <div className="Activity-table-cell flex5">Date/Time</div>
                        <div className="Activity-table-cell flex2">Side</div>
                        <div className="Activity-table-cell">Sell</div>
                        <div className="Activity-table-cell">Buy</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Amount</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Price</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Total</div>
                        <div className="Activity-table-cell Activity-table_actions flex1" />
                    </div>
                    <div style={{ height: ListHeight }} className="Activity-table-body">
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    width={width}
                                    height={height}
                                    rowHeight={ROW_HEIGHT}
                                    rowCount={tradeHistory.length}
                                    rowRenderer={
                                        ({ key, index, style }) =>
                                            this.getTradeHistoryRow(tradeHistory[index], key, style)} />
                            )}
                        </AutoSizer>
                    </div>
                </div>
            </div>
        );
    }
}
ActivityTradesHistory.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    history: PropTypes.arrayOf(PropTypes.any),
    loading: PropTypes.bool,
};
