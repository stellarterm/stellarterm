import React from 'react';
import PropTypes from 'prop-types';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../../../lib/Driver';
import images from '../../../../../images';

export default function SendSuccess(props) {
    const { d, awaitSigners } = props;
    const { txId, resetSendForm, accountId, assetToSend, amountToSend } = d.send;

    const resultMessage = awaitSigners ? (
        <React.Fragment>
            <div className="content_title">Additional signatures required</div>
            <div className="content_text">
                Transaction was signed with your secret key. <br />
                Sign the transaction in the multisig service of your choice and submit it to the network.
            </div>
        </React.Fragment>
    ) : (
        <React.Fragment>
            <div className="content_title">
                Transaction ID
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    title="StellarExpert"
                    href={`https://stellar.expert/explorer/${d.Server.isTestnet ? 'testnet' : 'public'}/tx/${txId}`}
                >
                    <img src={images['icon-info']} alt="info" />
                </a>
            </div>

            <div className="content_text">{txId}</div>
        </React.Fragment>
    );

    const identiconImg = createStellarIdenticon(accountId).toDataURL();
    const shortAddress = `${accountId.substr(0, 6)}...${accountId.substr(-6, 6)}`;

    return (
        <div className="Send_block">
            <div className="Send_details">
                {awaitSigners ? (
                    <img src={images['sign-unknown']} alt="multisig" className="status_icon" />
                ) : (
                    <img src={images['icon-big-circle-success']} alt="success" className="status_icon" />
                )}

                <h1>{awaitSigners ? 'Almost done' : `${amountToSend} ${assetToSend.asset.code}`}</h1>

                {!awaitSigners ? (
                    <div className="field_description">
                        Payment sent to <img src={identiconImg} alt="identicon" className="identicon_resolved" />
                        <span className="publicKey_resolved">{shortAddress}</span>
                    </div>
                ) : (
                    <div className="field_description" />
                )}

                <div className="content_main">
                    <div className="content_block">{resultMessage}</div>
                </div>
            </div>

            <div className="Send_button_block">
                <button className="s-button" onClick={() => resetSendForm()}>
                    Start over
                </button>
            </div>
        </div>
    );
}

SendSuccess.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    awaitSigners: PropTypes.bool,
};
