/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { List, AutoSizer, InfiniteLoader } from 'react-virtualized';
import BigNumber from 'bignumber.js';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import Driver from '../../../../../lib/Driver';
import images from '../../../../../images';
import { formatDate, ROW_HEIGHT, TABLE_MAX_HEIGHT, SCROLL_WIDTH } from './../Activity';
import Printify from '../../../../../lib/Printify';


export default class ActivityTradesHistory extends React.Component {
    static async goToStellarExpert(operation) {
        const op = await operation();
        window.open(`https://stellar.expert/explorer/public/tx/${op.transaction_hash}`, '_blank');
    }

    static filterHistoryByTrade(history) {
        return history.filter(item => (
            item.type === 'trade' && item.bought_amount !== '0.0000000'
        ));
    }

    componentWillUpdate(nextProps) {
        if (nextProps.history.length === this.props.history.length) {
            return;
        }
        const nextHistory = this.constructor.filterHistoryByTrade(nextProps.history);
        const currentHistory = this.constructor.filterHistoryByTrade(this.props.history);
        if (nextHistory.length - currentHistory.length === 0) {
            this.props.loadMore();
        }
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


        const { time, date } = formatDate(created_at);

        const price = new BigNumber(bought_amount).dividedBy(sold_amount).toFixed(7);
        const priceRevert = new BigNumber(sold_amount).dividedBy(bought_amount).toFixed(7);

        const isBuy = !counter.isNative();

        return (
            <div key={key} style={style} className="Activity-table-row">
                <div className="Activity-table-cell flex4">{date} {time}</div>
                <div className="Activity-table-cell flex2">
                    <span className={isBuy ? 'green' : 'red'}>{isBuy ? 'Buy' : 'Sell'}</span>
                </div>
                <div className="Activity-table-cell flex5">
                    <AssetCardInRow d={d} code={base.code} issuer={base.issuer} />
                </div>
                <div className="Activity-table-cell flex5">
                    <AssetCardInRow d={d} code={counter.code} issuer={counter.issuer} />
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex4">
                    {Printify.lightenZeros(isBuy ? bought_amount : sold_amount)}
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex4">
                    {Printify.lightenZeros(isBuy ? priceRevert : price)}
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex4">
                    {Printify.lightenZeros(isBuy ? sold_amount : bought_amount)}
                </div>
                <div className="Activity-table_actions Activity-table-cell flex1">
                    <img
                        title="stellar.expert"
                        src={images['icon-info']}
                        alt="i"
                        onClick={() => { this.constructor.goToStellarExpert(operation).then(); }} />
                </div>
            </div>
        );
    }

    render() {
        const { history, loading } = this.props;
        const tradeHistory = this.constructor.filterHistoryByTrade(history);

        if (!loading && tradeHistory.length === 0) {
            return (
                <div className="Activity_empty">You have no trade history</div>
            );
        }

        const listHeight = ROW_HEIGHT * tradeHistory.length;
        const maxHeight = Math.min(listHeight, TABLE_MAX_HEIGHT);
        const withScroll = listHeight > TABLE_MAX_HEIGHT;


        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>
                        Trading history
                        {loading &&
                            <span className="nk-spinner-small-black">
                                <div className="nk-spinner" />
                            </span>}
                    </span>
                </div>
                <div className="Activity-table">
                    <div className="Activity-table-row head" style={{ marginRight: withScroll ? SCROLL_WIDTH : 0 }}>
                        <div className="Activity-table-cell flex4">Date/Time</div>
                        <div className="Activity-table-cell flex2">Side</div>
                        <div className="Activity-table-cell flex5">Sell</div>
                        <div className="Activity-table-cell flex5">Buy</div>
                        <div className="Activity-table_item_right Activity-table-cell flex4">Amount</div>
                        <div className="Activity-table_item_right Activity-table-cell flex4">Price</div>
                        <div className="Activity-table_item_right Activity-table-cell flex4">Total</div>
                        <div className="Activity-table-cell Activity-table_actions flex1" />
                    </div>
                    <div style={{ height: maxHeight }} className="Activity-table-body">
                        <AutoSizer>
                            {({ height, width }) => (
                                <InfiniteLoader
                                    isRowLoaded={() => {}}
                                    rowCount={tradeHistory.length}
                                    loadMoreRows={(e) => {
                                        if (e.stopIndex + 40 > tradeHistory.length) {
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
                                            rowCount={tradeHistory.length}
                                            rowRenderer={
                                                ({ key, index, style }) =>
                                                    this.getTradeHistoryRow(tradeHistory[index], key, style)} />
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
ActivityTradesHistory.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    history: PropTypes.arrayOf(PropTypes.any),
    loading: PropTypes.bool,
    loadMore: PropTypes.func,
};
