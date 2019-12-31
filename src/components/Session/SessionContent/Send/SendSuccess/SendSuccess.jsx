import React from 'react';
import PropTypes from 'prop-types';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../../../lib/Driver';
import images from '../../../../../images';

export default function SendSuccess(props) {
    const { txId, resetSendForm } = props.d.send;

    const resultMessage = !props.awaitSiners ? (
        <React.Fragment>
            <div className="content_title">Transaction ID
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    title="StellarExpert"
                    href={`https://stellar.expert/explorer/public/tx/${txId}`}>
                    <img src={images['icon-info']} alt="info" />
                </a>
            </div>

            <div className="content_text">
                {txId}
            </div>
        </React.Fragment>
    ) : (
        <React.Fragment>
            <div className="content_title">Additional signature is needed</div>

            <div className="content_text">
                Transaction was signed with your key. <br />
                Add additional signatures and submit to the network.
            </div>
        </React.Fragment>
    );

    const { accountId, assetToSend, amountToSend } = props.d.send;

    const identiconImg = createStellarIdenticon(accountId).toDataURL();
    const shortAddress = `${accountId.substr(0, 6)}...${accountId.substr(-6, 6)}`;

    return (
        <div className="Send_block">
            <div className="Send_details">
                <img src={images['icon-big-circle-success']} alt="success" className="status_icon" />
                <h1>{amountToSend} {assetToSend.asset.code}</h1>

                <div className="field_description">
                    Was sent to <img src={identiconImg} alt="identicon" className="identicon_resolved" />
                    <span className="publicKey_resolved">{shortAddress}</span>
                </div>

                <div className="content_main">
                    <div className="content_block">
                        {resultMessage}
                    </div>
                </div>
            </div>

            <div className="Send_button_block">
                <button className="s-button" onClick={() => resetSendForm()}>
                    Ok
                </button>
            </div>
        </div>
    );
}

SendSuccess.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    awaitSiners: PropTypes.bool,
};
