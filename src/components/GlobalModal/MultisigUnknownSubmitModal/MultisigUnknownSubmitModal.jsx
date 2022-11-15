import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import CopyButton from '../../Common/CopyButton/CopyButton';

export default function MultisigUnknownSubmitModal(props) {
    const { data, submit } = props;
    const { tx, isTestnet } = data;

    const network = isTestnet ? 'test' : 'public';
    const encodedTx = encodeURIComponent(tx);
    const expertLink = `https://laboratory.stellar.org/#xdr-viewer?input=${encodedTx}&type=TransactionEnvelope&network=${network}`;

    return (
        <div className="MultisigUnknownSubmitModal ">
            <div className="MultisigUnknownSubmitModal__header">More signatures needed</div>
            <div className="MultisigUnknownSubmitModal__content">
                <div className="MultisigUnknownSubmitModal__title">
                    <img src={images['sign-unknown']} className="MultisigUnknownSubmitModal__logo" alt="sign unknown" />
                    <div>
                        <span>
                            <b>Your account has multisignature enabled.</b>
                        </span>
                        <span>StellarTerm has signed the transaction, now continue with your multisig service</span>
                    </div>
                </div>
                <div className="MultisigUnknownSubmitModal__XDR_header">
                    <span>Transaction XDR</span>
                    <CopyButton text={tx} />
                </div>
                <div className="MultisigUnknownSubmitModal__XDR_content">
                    <div className="MultisigUnknownSubmitModal__XDR_content-container">
                        {tx}

                        <div className="MultisigUnknownSubmitModal__XDR_content_link">
                            <a
                                href={expertLink}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                            >
                                View transaction details
                                <img src={images['icon-arrow-right-green']} alt="" />
                            </a>
                        </div>
                    </div>
                    <span>Copy this XDR to your multisignature service and add additional signatures.</span>
                </div>
            </div>
            <div className="MultisigUnknownSubmitModal__navigation">
                <button className="MultisigUnknownSubmitModal__button" onClick={() => submit.cancel()}>
                    Ok
                </button>
            </div>
        </div>
    );
}
MultisigUnknownSubmitModal.propTypes = {
    data: PropTypes.shape({
        tx: PropTypes.string,
        isTestnet: PropTypes.bool,
    }),
    submit: PropTypes.objectOf(PropTypes.func),
};
