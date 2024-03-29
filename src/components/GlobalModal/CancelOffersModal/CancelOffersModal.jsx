import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Driver from '../../../lib/driver/Driver';
import ErrorHandler from '../../../lib/helpers/ErrorHandler';
import { AUTH_TYPE } from '../../../lib/constants/sessionConstants';


export default class CancelOffersModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonReady: true,
            errorMessage: '',
        };
    }
    async removeOffers(submit, offersData) {
        const { side, offers } = offersData;
        this.setState({ buttonReady: false });

        if (this.props.d.session.authType === AUTH_TYPE.LEDGER) {
            submit.cancel();
        }

        const signAndSubmit = await this.props.d.session.handlers
            .removeOffer(offers.map(offer => Object.assign({}, offer, { isBuyOffer: side === 'buy' })));

        if (signAndSubmit.status === 'await_signers') {
            submit.cancel();
        }
        try {
            await signAndSubmit.serverResult;
            submit.cancel();
        } catch (error) {
            const errorMessage = ErrorHandler(error);
            this.setState({
                buttonReady: true,
                errorMessage,
            });
        }
    }
    render() {
        const { submit, offersData } = this.props;
        const { side } = offersData;
        const { errorMessage, buttonReady } = this.state;
        return (
            <div className="CancelOffersModal">
                <div className="Modal_header">
                    <span>Confirmation</span>
                    <img
                        src={images['icon-close']}
                        alt="X"
                        onClick={() => submit.cancel()}
                    />
                </div>
                <div className="CancelOffersModal_content">
                    <div className="CancelOffersModal_title">
                        Do you really want to cancel all {side} offers?
                    </div>
                    <div className="CancelOffersModal_text">
                        After confirmation, all of your {side} offers will be
                         removed, funds will return to your balance.
                    </div>
                    {errorMessage &&
                        <div className="OfferMakerResultMessage_message failed">
                            <img src={images['icon-circle-fail']} alt="failed" />
                            {errorMessage}
                        </div>}
                    <div className="Modal_button-block">
                        <button
                            className="cancel-button"
                            disabled={!buttonReady}
                            onClick={() => submit.cancel()}
                        >
                            Back
                        </button>
                        <button
                            className="s-button"
                            disabled={!buttonReady}
                            onClick={() => this.removeOffers(submit, offersData)}
                        >
                            {buttonReady ? 'Confirm' : <div className="nk-spinner" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
CancelOffersModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
    offersData: PropTypes.objectOf(PropTypes.any),
};
