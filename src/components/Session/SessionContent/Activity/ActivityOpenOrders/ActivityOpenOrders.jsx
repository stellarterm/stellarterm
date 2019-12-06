import React from 'react';
import PropTypes from 'prop-types';
import { AutoSizer, List } from 'react-virtualized';
import Driver from '../../../../../lib/Driver';
import ActivityOpenOrdersRow from './ActivityOpenOrdersRow/ActivityOpenOrdersRow';
import { ROW_HEIGHT, TABLE_MAX_HEIGHT, SCROLL_WIDTH } from './../Activity';

export default class ActivityOpenOrders extends React.Component {
    static getTableContent(offer, key, style, d) {
        return <ActivityOpenOrdersRow key={key} virtualKey={key} offer={offer} d={d} style={style} />;
    }

    componentDidUpdate() {
        const hasNullDate = this.props.openOffers.find(offer => offer.last_modified_time === null);
        if (hasNullDate) {
            this.props.d.session.account.updateOffers();
        }
    }

    cancelAllOffers(e, side, offers) {
        e.preventDefault();
        const offersData = { side, offers };
        this.props.d.modal.handlers.activate('CancelOffersModal', offersData);
    }

    render() {
        const { d, openOffers } = this.props;
        if (openOffers.length === 0) {
            return (<div className="Activity_empty">You have no open orders.</div>);
        }

        const listHeight = ROW_HEIGHT * openOffers.length;
        const maxHeight = Math.min(listHeight, TABLE_MAX_HEIGHT);
        const withScroll = listHeight > TABLE_MAX_HEIGHT;

        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>Open orders</span>
                    {openOffers.length > 1 &&
                        <button
                            className="CancelOffers_button"
                            onClick={e => this.cancelAllOffers(e, '', openOffers)}>
                            <span>+</span>
                            Cancel all orders
                        </button>}
                </div>
                <div className="Activity-table">
                    <div className="Activity-table-row head" style={{ marginRight: withScroll ? SCROLL_WIDTH : 0 }}>
                        <div className="Activity-table-cell flex3">Created</div>
                        <div className="Activity-table-cell flex3">Sell</div>
                        <div className="Activity-table-cell flex3">Buy</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Amount</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Price</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Total</div>
                        <div className="Activity-table-cell Activity-table_actions flex1_5" />
                    </div>
                    <div className="Activity-table-body" style={{ height: maxHeight }}>
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    width={width}
                                    height={height}
                                    rowHeight={ROW_HEIGHT}
                                    rowCount={openOffers.length}
                                    rowRenderer={
                                        ({ key, index, style }) =>
                                            this.constructor.getTableContent(openOffers[index], key, style, d)} />
                            )}
                        </AutoSizer>
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
