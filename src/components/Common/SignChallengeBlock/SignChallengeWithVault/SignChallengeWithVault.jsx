import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from '@stellar/stellar-sdk';
import images from '../../../../images';
import {
    PROVIDER_DATA,
    THRESHOLD_MULTIPLIER,
} from '../../../../lib/constants/multisigConstants';
import Driver from '../../../../lib/driver/Driver';
import Multisig from '../../../../lib/driver/driverInstances/Multisig';
import useIsMounted from '../../../../lib/hooks/useIsMounted';


const SignChallengeWithVault = ({ d, resolver, tx }) => {
    const { multisigProvider, requiredSigners } = d.multisig;

    const hash = tx.hash().toString('hex');

    const [hasAllSignatures, setHasAllSignatures] = useState(false);
    const [vaultRequestPending, setVaultRequestPending] = useState(false);
    const [signedTx, setSignedTx] = useState(null);

    const isMounted = useIsMounted();

    const checkTransaction = useCallback(() => {
        if (hasAllSignatures) {
            resolver(new StellarSdk.Transaction(signedTx.xdr, signedTx.network_passphrase));
            return;
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
    }, [hasAllSignatures, vaultRequestPending, signedTx]);

    useEffect(() => {
        if (hasAllSignatures || !isMounted.current) {
            return;
        }
        const interval = setInterval(() => {
            checkTransaction();
        }, 5000);

        // eslint-disable-next-line consistent-return
        return () => { clearInterval(interval); };
    }, [hasAllSignatures, isMounted]);


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
