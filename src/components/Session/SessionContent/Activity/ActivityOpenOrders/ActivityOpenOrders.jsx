import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';
import ActivityOpenOrdersRow from './ActivityOpenOrdersRow/ActivityOpenOrdersRow';


export default class ActivityOpenOrders extends React.Component {
    static getTableContent(openOffers, d) {
        return openOffers.map(offer => <ActivityOpenOrdersRow key={offer.id} offer={offer} d={d} />);
    }

    componentWillMount() {
        this.props.d.session.account.updateOffers();
    }

    cancelAllOffers(e, side, offers) {
        e.preventDefault();
        const offersData = { side, offers };
        this.props.d.modal.handlers.activate('CancelOffersModal', offersData);
    }

    render() {
        const { d, openOffers } = this.props;
        if (openOffers.length === 0) {
            return (
                <div className="Activity_empty">You have no open orders.</div>
            );
        }

        const rows = this.constructor.getTableContent(openOffers, d);

        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>Open orders</span>
                    <button
                        className="CancelOffers_button"
                        onClick={e => this.cancelAllOffers(e, '', openOffers)}>
                        <span>+</span>
                        Cancel all orders
                    </button>
                </div>
                <div className="Activity-table">
                    <div className="Activity-table-row head">
                        <div className="Activity-table-cell flex5">Created</div>
                        <div className="Activity-table-cell flex2">Side</div>
                        <div className="Activity-table-cell">Sell</div>
                        <div className="Activity-table-cell">Buy</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Amount</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Price</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Total</div>
                        <div className="Activity-table-cell Activity-table_actions flex2" />
                    </div>
                    <div className="Activity-table-body">
                        {rows}
                    </div>
                </div>
            </div>
        );
    }
}
ActivityOpenOrders.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    openOffers: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};
