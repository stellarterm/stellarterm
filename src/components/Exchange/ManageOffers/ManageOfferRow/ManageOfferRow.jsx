import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';
import Driver from '../../../../lib/driver/Driver';
import { TX_STATUS } from '../../../../lib/constants/sessionConstants';
import ErrorHandler from '../../../../lib/helpers/ErrorHandler';

export default class ManageOffers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: true,
        };
    }

    getActionButtons() {
        const { ready } = this.state;

        return (
            <div className="ManageOffers__table__actions">
                <button onClick={e => this.handleEdit(e)} title="Edit offer">
                    <img src={images['icon-edit-small']} alt="..." />
                </button>
                <button onClick={e => this.handleCancel(e)} title="Remove offer">
                    {ready ?
                        <span>+</span> :
                        <img src={images['icon-circle-preloader-gif']} alt="..." width="10" height="10" /> }
                </button>
            </div>
        );
    }

    getRowItems() {
        const { price, baseAmount, counterAmount } = this.props.rectifiedOffer;
        const rowItems = [price, baseAmount, counterAmount];
        if (this.props.side === 'buy') {
            rowItems.reverse();
        }

        rowItems.push(this.getActionButtons());

        return (
            rowItems.map((item, index) => {
                const key = item + index;
                return (
                    <td className="ManageOffers__table__row__item" key={key}>{item}</td>
                );
            })
        );
    }

    handleEdit(event) {
        event.preventDefault();
        const { rectifiedOffer, side } = this.props;
        const offerData = { rectifiedOffer, side };
        this.props.d.modal.handlers.activate('EditOfferModal', offerData);
    }

    async handleCancel(event) {
        event.preventDefault();

        const { handlers } = this.props.d.session;
        const { rectifiedOffer, side } = this.props;
        const signAndSubmit = await handlers.removeOffer(Object.assign(rectifiedOffer, { isBuyOffer: side === 'buy' }));

        if (signAndSubmit.status !== TX_STATUS.FINISH) { return; }

        this.setState({ ready: false });

        try {
            await signAndSubmit.serverResult;
        } catch (error) {
            const errorMessage = ErrorHandler(error);
            this.props.d.toastService.error('Can’t cancel the offer', errorMessage);
            console.error('Errored when cancelling offer', error);
            this.setState({ ready: 'true' });
        }
    }

    render() {
        return (
            <tr className="ManageOffers__table__row">
                {this.getRowItems()}
            </tr>
        );
    }
}
ManageOffers.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    side: PropTypes.string,
    rectifiedOffer: PropTypes.shape({
        price: PropTypes.string,
        baseAmount: PropTypes.string,
        counterAmount: PropTypes.string,
    }),
};

