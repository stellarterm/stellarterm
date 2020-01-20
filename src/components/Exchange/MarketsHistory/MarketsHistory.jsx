import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { AutoSizer, List } from 'react-virtualized';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../lib/Driver';
import Printify from '../../../lib/Printify';
import images from '../../../images';

export default class MarketsHistory extends React.Component {
    static getAccountRow(publiKey) {
        const baseAccount = createStellarIdenticon(publiKey).toDataURL();
        const basePublicKey = publiKey && `${publiKey.substr(0, 5)}...${publiKey.substr(-5, 5)}`;
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

        const tradePrice = (trade.counter_amount / trade.base_amount).toFixed(7);

        const sideText = trade.base_is_seller ? (
            <span className="trade_Side trade_down"><img src={images['icon-trade-down']} alt="trade-down" /> Sell</span>
        ) : (
            <span className="trade_Side trade_up"><img src={images['icon-trade-up']} alt="trade-up" /> Buy</span>
        );

        const rowItems = [
            { value: sideText, key: 'side', className: 'row-left row-short' },
            { value: `${relativeTradeTime} ago`, key: 'date', className: 'row-left' },
            { value: this.constructor.getAccountRow(trade.base_account), key: 'seller', className: 'row-left' },
            { value: this.constructor.getAccountRow(trade.counter_account), key: 'buyer', className: 'row-left' },
            { value: Printify.lightenZeros(tradePrice), key: 'price', className: 'row-right' },
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

        return (
            <div className="MarketTable">
                <div className="MarketTable_header">
                    <div className="MarketTable_header_item row-left row-short">
                        <span className="header_text">Side</span>
                    </div>
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
                        <span className="header_text">Amount</span>
                        <span className="pair_small"> ({counterSelling.code})</span>
                    </div>
                </div>

                <div className="MarketTable_table" style={{ height: 600 }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                width={width}
                                height={height}
                                rowHeight={30}
                                rowCount={trades.length}
                                rowRenderer={({ key, index, style }) => this.getRowItems(trades[index], key, style)} />
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }

    render() {
        const { trades } = this.state;
        const noMarketTrades = trades.length === 0;

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
