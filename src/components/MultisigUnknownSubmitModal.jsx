import React from 'react';
import PropTypes from 'prop-types';
import CopyButton from './CopyButton';

const images = require('../images');


export default function MultisigUnknownSubmitModal(props) {
    const { tx, submit } = props;

    return (
        <div className="MultisigUnknownSubmitModal ">
            <div className="MultisigUnknownSubmitModal__header">
                More signatures needed
            </div>
            <div className="MultisigUnknownSubmitModal__content">
                <div className="MultisigUnknownSubmitModal__title">
                    <img
                        src={images['sign-unknown']}
                        className="MultisigUnknownSubmitModal__logo"
                        alt="sign unknown" />
                    <div>
                        <span><b>Your account has multisignature enabled.</b></span>
                        <span>StellarTerm has signed the transaction, now continue with your multisig service</span>
                    </div>
                </div>
                <div className="MultisigUnknownSubmitModal__XDR_header">
                    <span>Transaction XDR</span>
                    <CopyButton text={tx} />
                </div>
                <div className="MultisigUnknownSubmitModal__XDR_content">
                    <div>{tx}</div>
                    <span>Copy this XDR to your multisignature service and add additional signatures.</span>
                </div>
            </div>
            <div className="MultisigUnknownSubmitModal__navigation">
                <button className="MultisigUnknownSubmitModal__button" onClick={() => submit.cancel()}>Ok</button>
            </div>
        </div>
    );
}
MultisigUnknownSubmitModal.propTypes = {
    tx: PropTypes.string,
    submit: PropTypes.objectOf(PropTypes.func),
};
