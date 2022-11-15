import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Driver from '../../../lib/driver/Driver';
import Stellarify from '../../../lib/helpers/Stellarify';
import ManageOfferRow from './ManageOfferRow/ManageOfferRow';
import { SESSION_EVENTS, SESSION_STATE } from '../../../lib/constants/sessionConstants';

export default class ManageOffers extends React.Component {
    constructor(props) {
        super(props);
        this.unsub = this.props.d.session.event.sub(eventName => {
            if (eventName === SESSION_EVENTS.ACCOUNT_EVENT) {
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        this.unsub();
    }

    getSortedRectifiedOffers(side) {
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const { offers } = this.props.d.session.account;

        return Object.values(offers)
            .filter(offer => Stellarify.isOfferRelevant(baseBuying, counterSelling, offer))
            .map(offer => Stellarify.rectifyOffer(baseBuying, counterSelling, offer))
            .filter(offer => offer.side === side)
            .sort((a, b) => (side === 'buy' ? Number(b.price) - Number(a.price) : Number(a.price) - Number(b.price)));
    }

    getManageOffersRows(side, sortedRectifiedOffers) {
        if (sortedRectifiedOffers.length === 0) {
            return (
                <tr>
                    <td className="ManageOffers__table__row__none" colSpan="4">
                        You have no {side} offers for this orderbook.
                    </td>
                </tr>
            );
        }

        return sortedRectifiedOffers.map(offer => (
            <ManageOfferRow side={side} d={this.props.d} rectifiedOffer={offer} key={offer.id} />
        ));
    }

    cancelAllOffers(e, side, offers) {
        e.preventDefault();
        const offersData = { side, offers };
        this.props.d.modal.handlers.activate('CancelOffersModal', offersData);
    }

    renderManageOffersTable(side) {
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const sortedRectifiedOffers = this.getSortedRectifiedOffers(side);
        const hasOffers = !!sortedRectifiedOffers.length;

        const headerTitles = [
            { title: counterSelling.getCode(), className: 'ManageOffers__table__header__item' },
            { title: baseBuying.getCode(), className: 'ManageOffers__table__header__item' },
            { title: 'Price', className: 'ManageOffers__table__header__item' },
        ];

        if (side === 'sell') {
            headerTitles.reverse();
        }
        headerTitles.push({ title: 'Actions', className: 'ManageOffers__table__header__item' });

        return (
            <div className="ManageOffers__content island__sub__division">
                <div className="ManageOffers__header">
                    <h3 className="ManageOffers__title">Your {side} offers</h3>
                    {sortedRectifiedOffers.length > 1 &&
                        <button
                            className="CancelOffers_button"
                            onClick={e => this.cancelAllOffers(e, side, sortedRectifiedOffers)}
                        >
                            <span>+</span>
                            Cancel {side} offers
                        </button>}
                </div>
                <table className="ManageOffers__table">
                    <tbody>
                        {hasOffers &&
                            <tr className="ManageOffers__table__header">
                                {headerTitles.map(({ title, className }) => (
                                    <td className={className} key={title}>
                                        {title}
                                    </td>
                                ))}
                            </tr>
                        }
                        {this.getManageOffersRows(side, sortedRectifiedOffers)}
                    </tbody>
                </table>
            </div>
        );
    }

    render() {
        if (this.props.d.session.state === SESSION_STATE.OUT || this.props.d.session.state === SESSION_STATE.LOADING) {
            return (
                <div className="island__paddedContent">
                    <div className="OfferMakerOverview_login">
                        <span className="offer_message">
                            <a onClick={() => this.props.d.modal.handlers.activate('LoginModal')}>Log in</a>
                            {' '}or <Link to="/signup/">Create new account </Link> to see your open offers
                        </span>
                    </div>
                </div>
            );
        }

        if (this.props.d.session.state === SESSION_STATE.UNFUNDED) {
            return (
                <div className="island__paddedContent">
                    <div className="OfferMakerOverview_login">
                        <span className="offer_message">
                            <Link to="/account/">Activate your Stellar account to trade</Link>
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className="ManageOffers">
                {this.renderManageOffersTable('buy')}
                {this.renderManageOffersTable('sell')}
            </div>
        );
    }
}
ManageOffers.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
