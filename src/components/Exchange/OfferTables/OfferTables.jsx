import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import Driver from '../../../lib/driver/Driver';
import OfferTable from './OfferTable/OfferTable';

export default class OfferTables extends React.Component {
    static getOpenOffersData(side, orderbook) {
        const isBuy = side === 'buy';
        const offers = isBuy ? orderbook.bids.slice(0, 20) : orderbook.asks.slice(0, 20);
        let depth = 0;

        return offers.map((offer, index) => {
            if (isBuy) {
                depth += Number(offer.amount);
            } else {
                depth += Number(offer.amount) * Number(offer.price);
            }
            return {
                key: `${index}-${offer.price}-${offer.amount}`,
                price: offer.price,
                base: isBuy ? (Number(offer.amount) / Number(offer.price)).toFixed(7) : offer.amount,
                counter: isBuy ? offer.amount : (Number(offer.amount) * Number(offer.price)).toFixed(7),
                depth: depth.toFixed(7),
            };
        });
    }

    static getMaxDepth(orderbook) {
        const { asks, bids } = orderbook;

        const cappedDepthAsks = asks.slice(0, 20).reduce((acc, ask) => {
            if (Number(ask.price) / Number(asks[0].price) < 1.2) {
                return Number(acc) + Number(ask.amount) * Number(ask.price);
            }
            return acc;
        }, 0);

        const cappedDepthBids = bids.slice(0, 20).reduce((acc, bid) => {
            if (Number(bids[0].price) / Number(bid.price) < 1.2) {
                return Number(acc) + Number(bid.amount);
            }
            return acc;
        }, 0);

        return BigNumber.max(cappedDepthAsks.toFixed(7), cappedDepthBids.toFixed(7));
    }

    getOffersTable(side, orderbook) {
        const capitalizedSide = side === 'buy' ? 'Buy' : 'Sell';
        const baseAssetName = orderbook.baseBuying.getCode();
        const counterAssetName = orderbook.counterSelling.getCode();

        return (
            <div className="island__sub__division">
                <h3 className="island__sub__division__title">{capitalizedSide} offers</h3>
                <OfferTable
                    side={side}
                    offers={this.constructor.getOpenOffersData(side, orderbook)}
                    maxDepth={this.constructor.getMaxDepth(orderbook)}
                    counterCurrency={counterAssetName}
                    baseCurrency={baseAssetName}
                    d={this.props.d}
                />
            </div>
        );
    }

    render() {
        const orderbook = this.props.d.orderbook.data;
        const { asks, bids } = orderbook;
        const isOrderbookEmpty = asks.length === 0 && bids.length === 0;

        if (!orderbook.ready) {
            return <div>Loading</div>;
        }

        return isOrderbookEmpty ? (
            <div className="OfferTables">
                <div className="island__sub__division">
                    <h3 className="island__sub__division__title">Orderbook is empty</h3>
                </div>
            </div>
        ) : (
            <div className="OfferTables">
                {this.getOffersTable('buy', orderbook)}
                {this.getOffersTable('sell', orderbook)}
            </div>
        );
    }
}
OfferTables.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
