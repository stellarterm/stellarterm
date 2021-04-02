import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { AutoSizer, List } from 'react-virtualized';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../lib/Driver';
import Printify from '../../../lib/Printify';
import images from '../../../images';

let prevPrice = 0;

export default class MarketsHistory extends React.Component {
    static getAccountRow(publiKey) {
        const baseAccount = createStellarIdenticon(publiKey).toDataURL();
        const basePublicKey = publiKey && `${publiKey.substr(0, 6)}...${publiKey.substr(-6, 6)}`;
        return <span className="publicKey_icon"><img src={baseAccount} alt={publiKey} /> {basePublicKey}</span>;
    }

    constructor(props) {
        super(props);
        this.state = {
            trades: this.props.d.orderbook.data.marketTradesHistory,
        };
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
            { value: this.constructor.getAccountRow(trade.base_account), key: 'seller', className: 'row-left' },
            { value: this.constructor.getAccountRow(trade.counter_account), key: 'buyer', className: 'row-left' },
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
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const { trades } = this.state;
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
                        <span className="pair_small"> ({baseBuying.code}/{counterSelling.code})</span>
                    </div>
                    <div className="MarketTable_header_item row-right">
                        <span className="header_text">Amount</span>
                        <span className="pair_small"> ({baseBuying.code})</span>
                    </div>
                    <div className="MarketTable_header_item row-right">
                        <span className="header_text">Total</span>
                        <span className="pair_small"> ({counterSelling.code})</span>
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
                                }} />
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }

    render() {
        const { trades } = this.state;
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
