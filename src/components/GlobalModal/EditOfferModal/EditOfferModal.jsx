import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import OfferMaker from '../../Exchange/OfferMakers/OfferMaker/OfferMaker';
import Driver from '../../../lib/Driver';


export default class EditOfferModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            side: this.props.offerData.side,
            reverted: false,
        };
    }

    getCurrentEditedOffer() {
        const { rectifiedOffer, withSwitch } = this.props.offerData;
        const { reverted } = this.state;
        if (!withSwitch || !reverted) {
            return rectifiedOffer;
        }
        const { priceRevert, baseAmount, counterAmount, id, base, counter } = rectifiedOffer;
        return {
            price: priceRevert,
            base: counter,
            counter: base,
            counterAmount: baseAmount,
            baseAmount: counterAmount,
            id,
        };
    }

    revertOffer() {
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        this.props.d.orderbook.handlers.setOrderbook(counterSelling, baseBuying);
        this.setState({
            side: this.state.side === 'sell' ? 'buy' : 'sell',
            reverted: !this.state.reverted,
        });
    }

    render() {
        const { submit, offerData, d } = this.props;
        const { withSwitch } = offerData;
        const { side } = this.state;
        const editedOffer = this.getCurrentEditedOffer();
        const { base, counter } = editedOffer;

        return (
            <div className="EditOfferModal">
                <div className="Modal_header">
                    <span>Edit {side} offer</span>
                    <img
                        src={images['icon-close']}
                        alt="X"
                        onClick={() => submit.cancel()} />
                </div>

                {withSwitch &&
                    <div className="EditOfferModal_switch-block">
                        <div className="EditOfferModal_switch-description">
                            <span className="EditOfferModal_switch-description-title">
                                The price is not looking right?
                            </span>
                            <span className="EditOfferModal_switch-description-question">
                                Maybe you’d like to see the {base.code || 'XLM'} to {counter.code || 'XLM'} price?
                            </span>
                            <span
                                className="EditOfferModal_switch-description-button"
                                onClick={() => this.revertOffer()}>
                                    <img src={images['icon-swap-green']} alt="swap" />
                                    <span>Swap pair and view as {side === 'sell' ? 'buy' : 'sell'} offer</span>
                            </span>
                        </div>
                        <div className="EditOfferModal_info">
                            <img src={images['icon-info-gray']} alt="i" />
                            <div className="EditOfferModal_info-popup">
                                SDEX allows you to trade any market pair, so you can exchange any assets between each
                                 other, e.g. ABC to XYZ (or vice versa). For pending orders we don’t know whether you
                                 tried to buy ABC or sell XYZ. That’s why you can swap sides and view each order as a
                                 buy or sell order - whatever makes more sense to you.
                            </div>
                        </div>
                    </div>
                }

                <div className="EditOfferModal_content">
                    <OfferMaker side={side} d={d} existingOffer={editedOffer} />
                </div>
            </div>
        );
    }
}
EditOfferModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
    offerData: PropTypes.objectOf(PropTypes.any),
};
