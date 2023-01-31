import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../lib/driver/Driver';
import {
    MULTISIG_PROVIDERS,
} from '../../../lib/constants/multisigConstants';
import Multisig from '../../../lib/driver/driverInstances/Multisig';
import SignChallengeWithVault from './SignChallengeWithVault/SignChallengeWithVault';
import SignChallengeManually from './SignChallengeManually/SignChallengeManually';


const SignChallengeBlock = ({ d, signedChallengeResolver, challengeTx }) => {
    const [sentToVault, setSentToVault] = useState(null);
    const { multisigProvider } = d.multisig;
    const isVault = multisigProvider === MULTISIG_PROVIDERS.LOBSTR_VAULT;

    const xdr = challengeTx.toEnvelope().toXDR('base64');


    useEffect(() => {
        if (isVault) {
            Multisig.sendXdrToVault(xdr)
                .then(() => {
                    setSentToVault(true);
                })
                .catch(() => {
                    setSentToVault(false);
                });
        }
    }, []);

    if (isVault && sentToVault === null) {
        return (
            <div className="content_main">
                <div className="loader_container">
                    <div className="nk-spinner" />
                </div>
            </div>
        );
    }

    if (isVault && sentToVault) {
        return <SignChallengeWithVault d={d} resolver={signedChallengeResolver} tx={challengeTx} />;
    }

    return <SignChallengeManually d={d} resolver={signedChallengeResolver} tx={challengeTx} />;
};

export default SignChallengeBlock;

SignChallengeBlock.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    signedChallengeResolver: PropTypes.instanceOf(Promise.resolve).isRequired,
    challengeTx: PropTypes.instanceOf(StellarSdk.Transaction).isRequired,
};
