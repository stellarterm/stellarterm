import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import Format from '../../../../lib/Format';
import Driver from '../../../../lib/Driver';
import Printify from '../../../../lib/Printify';

// Dumb component that mainly renders the UI
export default class OfferTable extends React.Component {
    getRowStyle(isBuy, offer) {
        const depthPercentage = Math.min(100, Number((offer.depth / this.props.maxDepth) * 100).toFixed(1));

        const rowStyle = {};
        const background = isBuy ? '#dcf6de' : '#fed6d8';
        const gradientDirection = isBuy ? 'to left' : 'to right';

        rowStyle.background = `linear-gradient(${gradientDirection}, ${background} ${depthPercentage}%, transparent ${depthPercentage}%)`;

        return rowStyle;
    }

    getHeader(isBuy) {
        const headerItems = [
            `Sum ${this.props.counterCurrency}`,
            this.props.counterCurrency,
            this.props.baseCurrency,
            'Price',
        ];

        if (!isBuy) {
            headerItems.reverse();
        }

        return headerItems.map(item => (
            <div className="OfferTable__header__item" key={item}>
                {item}
            </div>
        ));
    }

    getRowItems(isBuy, offer) {
        const hasOffers = this.props.offers.length !== 0;

        const depthNumDecimals = hasOffers
            ? Math.max(0, Format.niceNumDecimals(this.props.offers[this.props.offers.length - 1].depth))
            : 7;

        const priceNumDecimals = 7;
        const rowItems = [
            {
                value: Number(offer.depth).toLocaleString('en-US', {
                    minimumFractionDigits: depthNumDecimals,
                    maximumFractionDigits: depthNumDecimals,
                }),
                key: 'sum',
            },
            { value: Printify.lightenZeros(offer.counter), key: 'counter' },
            { value: Printify.lightenZeros(offer.base), key: 'base' },
            { value: Printify.lightenZeros(offer.price, priceNumDecimals), key: 'price' },
        ];

        if (!isBuy) {
            rowItems.reverse();
        }

        return rowItems.map(({ value, key }) => (
            <div key={key} className="OfferTable__row__item">
                {value}
            </div>
        ));
    }

    getRows(isBuy) {
        return this.props.offers.map(offer => (
            <div className="OfferTable__row_background" key={offer.key}>
                <div
                    className="OfferTable__row"
                    style={this.getRowStyle(isBuy, offer)}
                    onClick={() => this.props.d.orderbook.handlers.pickPrice(offer.price)}>
                    {this.getRowItems(isBuy, offer)}
                </div>
            </div>
        ));
    }

    render() {
        const isBuy = this.props.side === 'buy';
        const tableClass = `OfferTable ${isBuy ? 'OfferTable_buy' : 'OfferTable_sell'}`;

        return (
            <div className={tableClass}>
                <div className="OfferTable__header">{this.getHeader(isBuy)}</div>
                <div className="OfferTable__table">{this.getRows(isBuy)}</div>
            </div>
        );
    }
}
OfferTable.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    offers: PropTypes.arrayOf(PropTypes.object).isRequired,
    side: PropTypes.oneOf(['buy', 'sell']).isRequired,
    counterCurrency: PropTypes.string,
    baseCurrency: PropTypes.string,
    maxDepth: PropTypes.instanceOf(BigNumber),
};
