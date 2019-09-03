import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import images from '../../../../../../images';

export default function OfferMakerResultMessage(props) {
    const { successMessage, errorMessage, errorType } = props.offerState;

    if (successMessage) {
        return (
            <div className="OfferMakerResultMessage_message success">
                <img src={images['icon-circle-success']} alt="success" />
                {successMessage}
            </div>
        );
    }

    if (errorMessage) {
        switch (errorType) {
        case 'buy_not_authorized':
            return (
                <div className="OfferMakerResultMessage_message failed">
                    <img src={images['icon-circle-fail']} alt="failed" />
                    <div>
                        Unable to create offer because the issuer has not authorized you to trade this asset. To fix
                        this issue, check with the issuer{"'"}s website.
                        <br />
                        <br />
                        NOTE: Some issuers are restrictive in who they authorize.
                    </div>
                </div>
            );
        case 'op_low_reserve':
            return (
                <div className="OfferMakerResultMessage_message failed">
                    <img src={images['icon-circle-fail']} alt="failed" />
                    <div>
                        Your account does not have enough XLM to meet the{' '}
                        <a
                            href="https://www.stellar.org/developers/guides/concepts/fees.html#minimum-account-balance"
                            target="_blank"
                            rel="nofollow noopener noreferrer">
                        minimum balance
                        </a>
                        . For more info, see <Link to="/account/">
                        the minimum balance section</Link> of the account page.
                        <br />
                        <br />
                        Solutions:
                        <ul className="offerMaker_errors">
                            <li>Send at least 1 XLM to your account</li>
                            <li>Cancel an existing offer</li>
                            <li>
                                Decrease your minimum balance by <Link to="/account/addTrust/">
                                unaccepting an asset</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            );
        default:
            return (
                <div className="OfferMakerResultMessage_message failed">
                    <img src={images['icon-circle-fail']} alt="failed" />
                    <span>{errorMessage}</span>
                </div>
            );
        }
    }
    return null;
}
OfferMakerResultMessage.propTypes = {
    offerState: PropTypes.shape({
        errorMessage: PropTypes.string,
        errorType: PropTypes.string,
        successMessage: PropTypes.string,
    }),
};
