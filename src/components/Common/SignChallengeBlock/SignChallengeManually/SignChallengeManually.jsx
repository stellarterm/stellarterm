import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import images from '../../../../images';
import { CUSTOM_CONFIG_DATA, THRESHOLD_MULTIPLIER } from '../../../../lib/constants/multisigConstants';
import Driver from '../../../../lib/driver/Driver';
import CopyButton from '../../CopyButton/CopyButton';


const SignChallengeManually = ({ d, resolver, tx }) => {
    const { requiredSigners } = d.multisig;
    const xdr = tx.toEnvelope().toXDR('base64');

    const [signedXDR, setSignedXDR] = useState('');
    const [errorText, setErrorText] = useState('');
    const textAreaRef = useRef(null);

    const validateXDR = xdrToCheck => {
        if (!xdrToCheck) {
            setErrorText('');
            return;
        }
        try {
            // eslint-disable-next-line no-unused-vars
            const _tx = new StellarSdk.Transaction(xdrToCheck, d.Server.networkPassphrase);
            const weight = d.multisig.getSignaturesWeight(xdrToCheck, d.Server.networkPassphrase);
            if ((requiredSigners - 1) * THRESHOLD_MULTIPLIER <= weight) {
                setErrorText('');
            } else {
                setErrorText('Not enough signatures');
            }
        } catch (e) {
            setErrorText('Incorrect XDR');
        }
    };

    const onChange = event => {
        setSignedXDR(event.target.value);
        validateXDR(event.target.value);
        textAreaRef.current.style.height = '52px';
        textAreaRef.current.style.height = `${event.target.scrollHeight}px`;
    };

    const submit = () => {
        const transaction = new StellarSdk.Transaction(signedXDR, d.Server.networkPassphrase);
        resolver(transaction);
    };

    return (
        <React.Fragment>
            <div className="SignChallengeBlock">
                <div className="content_main">
                    <img
                        src={images[CUSTOM_CONFIG_DATA.logo]}
                        alt=""
                    />
                    <span className="SignChallengeBlock_title">Verification required</span>
                    <span className="SignChallengeBlock_description">
                        Prove the control over your Stellar account to continue.
                    </span>
                </div>
            </div>
            <div className="SignChallengeBlock_paragraph">
                <div className="SignChallengeBlock_paragraph-header">
                    <div className="SignChallengeBlock_paragraph-title">
                        Copy transaction XDR
                    </div>
                    <CopyButton text={xdr} btnText="COPY XDR" />
                </div>
                <div className="SignChallengeBlock_paragraph-content">
                    To continue with your deposit, copy the transaction XDR and collect additional signatures of other
                    co-signers. Return to StellarTerm once the transaction XDR is signed by account co-signers
                </div>
            </div>
            <div className="SignChallengeBlock_paragraph">
                <div className="SignChallengeBlock_paragraph-header">
                    <div className="SignChallengeBlock_paragraph-title">
                        Enter signed XDR
                    </div>
                </div>
                <div className="SignChallengeBlock_paragraph-content">
                    Collect the signatures of other co-signers of your Stellar account by signing the XDR
                    in the multisignature service of your choice. Once done, paste the signed XDR below
                    and press ‘Continue’ to sign with this account.
                </div>
                <div className="SignChallengeBlock_input-wrap">
                    <textarea
                        ref={textAreaRef}
                        className={`SignChallengeBlock_input ${errorText ? 'withError' : ''}`}
                        placeholder="Paste signed XDR here"
                        value={signedXDR}
                        onChange={onChange}
                    />
                    {Boolean(errorText) && <div className="Error-tooltip">{errorText}</div>}
                </div>


                <button
                    className="s-button SignChallengeBlock_button"
                    disabled={!signedXDR || Boolean(errorText)}
                    onClick={submit}
                >
                Continue
                </button>
            </div>
        </React.Fragment>);
};

export default SignChallengeManually;

SignChallengeManually.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    resolver: PropTypes.instanceOf(Promise.resolve).isRequired,
    tx: PropTypes.instanceOf(StellarSdk.Transaction).isRequired,
};
