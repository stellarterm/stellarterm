import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../lib/driver/Driver';
import { ORDERBOOK_LIST_SIZE } from '../../../lib/constants/orderbookContants';
import OfferTable from './OfferTable/OfferTable';

export default class OfferTables extends React.Component {
    getOffersTable(side, orderbook) {
        const capitalizedSide = side === 'buy' ? 'Buy' : 'Sell';
        const baseAssetName = orderbook.data.baseBuying.getCode();
        const counterAssetName = orderbook.data.counterSelling.getCode();

        const offers = side === 'buy' ?
            orderbook.zoomedBids.slice(0, ORDERBOOK_LIST_SIZE) :
            orderbook.zoomedAsks.slice(0, ORDERBOOK_LIST_SIZE);

        return (
            <div className="island__sub__division">
                <h3 className="island__sub__division__title">{capitalizedSide} offers</h3>
                <OfferTable
                    side={side}
                    offers={offers}
                    maxDepth={orderbook.maxDepth}
                    counterCurrency={counterAssetName}
                    baseCurrency={baseAssetName}
                    d={this.props.d}
                />
            </div>
        );
    }

    render() {
        const orderbook = this.props.d.orderbook;
        const { asks, bids, ready } = orderbook.data;
        const isOrderbookEmpty = asks.length === 0 && bids.length === 0;

        if (!ready) {
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
