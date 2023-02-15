import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { AutoSizer, List } from 'react-virtualized';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../lib/driver/Driver';
import Printify from '../../../lib/helpers/Printify';
import images from '../../../images';

let prevPrice = 0;

export default class MarketsHistory extends React.Component {
    static getAccountView(publicKey) {
        const baseAccount = createStellarIdenticon(publicKey).toDataURL();
        const basePublicKey = publicKey && `${publicKey.substr(0, 6)}...${publicKey.substr(-6, 6)}`;
        return <span className="publicKey_icon"><img src={baseAccount} alt={publicKey} /> {basePublicKey}</span>;
    }

    static getLiquidityView(liquidityPoolId) {
        const liquidityPoolShort = `${liquidityPoolId.slice(0, 4)}...${liquidityPoolId.slice(-4)}`;

        return <span>Liq. pool: {liquidityPoolShort}</span>;
    }

    static getAccountRow(isBase, trade) {
        if (isBase) {
            return trade.base_account ?
                MarketsHistory.getAccountView(trade.base_account) :
                MarketsHistory.getLiquidityView(trade.base_liquidity_pool_id);
        }

        return trade.counter_account ?
            MarketsHistory.getAccountView(trade.counter_account) :
            MarketsHistory.getLiquidityView(trade.counter_liquidity_pool_id);
    }

    componentDidMount() {
        this.unsub = this.props.d.trades.event.sub(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.unsub();
    }

    getRowItems(trade, rowKey, rowStyle) {
        const relativeTradeTime = moment(new Date(trade.ledger_close_time)).startOf('minute').fromNow(true);

        const currentPrice = (trade.price.n / trade.price.d).toFixed(7);

        const priceMoveUp = Number(currentPrice) > Number(prevPrice);
        const priceIsEqual = Number(currentPrice) === Number(prevPrice);

        let priceMoveClass = priceMoveUp ? 'trade_up' : 'trade_down';
        let sideText = priceMoveUp ? (
            <span className="trade_Side"><img src={images['icon-trade-up']} alt="up" /></span>
        ) : (
            <span className="trade_Side"><img src={images['icon-trade-down']} alt="down" /></span>
        );

        if (priceIsEqual) {
            priceMoveClass = '';
            sideText = '';
        }

        const rowItems = [
            { value: `${relativeTradeTime} ago`, key: 'date', className: 'row-left' },
            { value: this.constructor.getAccountRow(true, trade), key: 'seller', className: 'row-left' },
            { value: this.constructor.getAccountRow(false, trade), key: 'buyer', className: 'row-left' },
            { value: <div className={priceMoveClass}>{sideText} {Printify.lightenZeros(currentPrice)}</div>, key: 'price', className: 'row-right' },
            { value: Printify.lightenZeros(trade.base_amount), key: 'amount_base', className: 'row-right' },
            { value: Printify.lightenZeros(trade.counter_amount), key: 'amount_counter', className: 'row-right' },
        ];

        return (
            <div className="MarketTable_row" key={rowKey} style={rowStyle}>
                {rowItems.map(({ value, key, className }) => (
                    <div key={key} className={`MarketTable_row_item ${className}`}>
                        {value}
                    </div>
                ))}
            </div>
        );
    }

    getHistoryTable() {
        const { base, counter } = this.props.d.trades;
        const trades = this.props.d.trades.tradesHistory;
        const rowHeight = 30;
        const tableHeight = trades.length > 20 ? 600 : trades.length * rowHeight;

        return (
            <div className="MarketTable">
                <div className="MarketTable_header">
                    <div className="MarketTable_header_item row-left">
                        <span className="header_text">When</span>
                    </div>
                    <div className="MarketTable_header_item row-left">
                        <span className="header_text">Seller</span>
                    </div>
                    <div className="MarketTable_header_item row-left">
                        <span className="header_text">Buyer</span>
                    </div>
                    <div className="MarketTable_header_item row-right">
                        <span className="header_text">Price</span>
                        <span className="pair_small"> ({base.code}/{counter.code})</span>
                    </div>
                    <div className="MarketTable_header_item row-right">
                        <span className="header_text">Amount</span>
                        <span className="pair_small"> ({base.code})</span>
                    </div>
                    <div className="MarketTable_header_item row-right">
                        <span className="header_text">Total</span>
                        <span className="pair_small"> ({counter.code})</span>
                    </div>
                </div>

                <div className="MarketTable_table" style={{ height: tableHeight }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                width={width}
                                height={height}
                                rowHeight={rowHeight}
                                rowCount={trades.length}
                                rowRenderer={({ key, index, style }) => {
                                    prevPrice = index === trades.length - 1
                                        ? prevPrice
                                        : (trades[index + 1].price.n / trades[index + 1].price.d).toFixed(7);
                                    return this.getRowItems(trades[index], key, style);
                                }}
                            />
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }

    render() {
        const trades = this.props.d.trades.tradesHistory;
        const noMarketTrades = !trades || trades.length === 0;

        const marketsTitleText = `Market trades history ${noMarketTrades ? 'is empty' : ''}`;

        return (
            <div className="Markets_History">
                <div className="island__sub__division">
                    <h3 className="island__sub__division__title">{marketsTitleText}</h3>

                    {noMarketTrades ? null : this.getHistoryTable()}
                </div>
            </div>
        );
    }
}

MarketsHistory.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
