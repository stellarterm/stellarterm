import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import images from '../../../../images';
import {
    PROVIDER_DATA,
    THRESHOLD_MULTIPLIER,
    VAULT_NOT_ALLOW_UNSIGNED_TX_ERROR,
} from '../../../../lib/constants/multisigConstants';
import Ellipsis from '../../Ellipsis/Ellipsis';
import Driver from '../../../../lib/driver/Driver';
import Multisig from '../../../../lib/driver/driverInstances/Multisig';


const SignChallengeWithVault = ({ d, resolver, tx }) => {
    const { multisigProvider, requiredSigners } = d.multisig;

    const hash = tx.hash().toString('hex');
    const xdr = tx.toEnvelope().toXDR('base64');

    const [isTxSentToVault, setIsTxSentToVault] = useState(null);
    const [hasAllSignatures, setHasAllSignatures] = useState(false);
    const [vaultRequestPending, setVaultRequestPending] = useState(false);
    const [signedTx, setSignedTx] = useState(null);

    useEffect(() => {
        Multisig.sendXdrToVault(xdr)
            .then(() => {
                setIsTxSentToVault(true);
            })
            .catch(({ data, message }) => {
                if (data && data.detail !== VAULT_NOT_ALLOW_UNSIGNED_TX_ERROR) {
                    d.toastService.error('Error', message);
                }
                if (data && data.detail === VAULT_NOT_ALLOW_UNSIGNED_TX_ERROR) {
                    d.toastService.error('Enable the option "Allow Unsigned Transactions" in the  LOBSTR app');
                }
                setIsTxSentToVault(false);
            });
    }, []);

    const checkTransaction = () => {
        if (hasAllSignatures) {
            resolver(new StellarSdk.Transaction(signedTx.xdr, signedTx.network_passphrase));
        }
        if (vaultRequestPending) {
            return;
        }
        setVaultRequestPending(true);
        Multisig.getChallengeTxFromVault(hash).then(res => {
            const weight = d.multisig.getSignaturesWeight(res.xdr, res.network_passphrase);
            setVaultRequestPending(false);

            if ((requiredSigners - 1) * THRESHOLD_MULTIPLIER <= weight) {
                setHasAllSignatures(true);
                setSignedTx(res);
            }
        });
    };

    useEffect(() => {
        if (!setIsTxSentToVault || hasAllSignatures) {
            return;
        }
        const interval = setInterval(() => {
            checkTransaction();
        }, 5000);

            // eslint-disable-next-line consistent-return
        return () => { clearInterval(interval); };
    }, [setIsTxSentToVault, hasAllSignatures]);


    return (
        <React.Fragment>
            <div className="SignChallengeBlock">
                <div className="content_main">
                    <img
                        src={images[PROVIDER_DATA[multisigProvider].logo]}
                        alt=""
                        height="67"
                        width="67"
                    />
                    <span className="SignChallengeBlock_title">Verification required</span>
                    <span className="SignChallengeBlock_description">
                                Prove the control over your Stellar account to continue.
                                Collect the signatures of your LOBSTR Vault co-signers by signing the
                                challenge transaction in the LOBSTR Vault app.
                                Press the button below when done.
                    </span>
                </div>
            </div>
            <div className="SignChallengeBlock_footer">
                {isTxSentToVault === null && <span>Sending the transaction to the Vault<Ellipsis /></span>}

                {isTxSentToVault === true &&

                            <React.Fragment>
                                {vaultRequestPending && !hasAllSignatures &&
                                    <div className="spinner-green">
                                        <div className="nk-spinner" />
                                    </div>}
                                {!vaultRequestPending && !hasAllSignatures &&
                                    <img src={images['24-icon-warning-triangle']} alt="" />}
                                {hasAllSignatures && <img src={images['24-icon-success-circle']} alt="" />}

                                <div className="SignChallengeBlock_required-signers">
                                    {hasAllSignatures ?
                                        <span>Signed by LOBSTR Vault co-signers</span> :
                                        <React.Fragment>
                                            <span>{requiredSigners} signatures required</span>
                                            <span>This account and {requiredSigners - 1} LOBSTR Vault co-signers</span>
                                        </React.Fragment>}

                                </div>

                                <button className="s-button SignChallengeBlock_button" onClick={() => checkTransaction()}>
                                    {!hasAllSignatures && <img src={images['icon-retry']} alt="" />}
                                    {hasAllSignatures ? 'Continue' : 'Retry'}
                                </button>
                            </React.Fragment>}

                {isTxSentToVault === false && <span>Error sent</span>}
            </div>
        </React.Fragment>
    );
};


export default SignChallengeWithVault;

SignChallengeWithVault.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    resolver: PropTypes.instanceOf(Promise.resolve).isRequired,
    tx: PropTypes.instanceOf(StellarSdk.Transaction).isRequired,
};
