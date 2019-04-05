import React from 'react';
import PropTypes from 'prop-types';
import Stellarify from '../lib/Stellarify';
import ManageOfferRow from './ManageOfferRow';
import Driver from '../lib/Driver';


export default class ManageOffers extends React.Component {
    constructor(props) {
        super(props);
        this.unsub = this.props.d.session.event.sub(() => { this.forceUpdate(); });
    }

    componentWillUnmount() {
        this.unsub();
    }

    getSortedRectifiedOffers(side) {
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const { offers } = this.props.d.session.account;

        return Object.values(offers)
            .filter(offer => (
                Stellarify.isOfferRelevant(baseBuying, counterSelling, offer)
            ))
            .map(offer => (
                Stellarify.rectifyOffer(baseBuying, counterSelling, offer)
            ))
            .filter(offer => (
                offer.side === side
            ))
            .sort((a, b) => (
                side === 'buy' ?
                    Number(b.price) - Number(a.price) :
                    Number(a.price) - Number(b.price)
            ));
    }

    getManageOffersRows(side) {
        const sortedRectifiedOffers = this.getSortedRectifiedOffers(side);
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
            <ManageOfferRow invert={side === 'buy'} d={this.props.d} rectifiedOffer={offer} key={offer.id} />
        ));
    }

    renderManageOffersTable(side) {
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const headerTitles = [
            { title: '', className: '' },
            { title: counterSelling.getCode(), className: 'ManageOffers__table__header__item' },
            { title: baseBuying.getCode(), className: 'ManageOffers__table__header__item' },
            { title: 'Price', className: 'ManageOffers__table__header__item' }];

        if (side === 'sell') {
            headerTitles.reverse();
        }

        return (
            <div className=" island__sub__division">
                <h3 className="island__sub__division__title">Your {side} offers</h3>
                <table className="ManageOffers__table">
                    <tbody>
                    <tr className="ManageOffers__table__header">
                        {headerTitles.map(({ title, className }) => (
                            <td className={className} key={title}>{title}</td>
                        ))}
                    </tr>
                    {this.getManageOffersRows(side)}
                    </tbody>
              </table>
            </div>
        );
    }

    render() {
        if (this.props.d.session.state !== 'in') {
            return (
                <div className="island__paddedContent">
                    <a href="#account">Log in</a> to see your open offers
                </div>
            );
        }

        return (
            <div className="island--pb">
                <div className="ManageOffers">
                    <div className=" island__sub">
                        {this.renderManageOffersTable('buy')}
                        {this.renderManageOffersTable('sell')}
                    </div>
                </div>
            </div>
        );
    }
}
ManageOffers.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

