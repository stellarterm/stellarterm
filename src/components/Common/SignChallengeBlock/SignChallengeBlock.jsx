import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../lib/driver/Driver';
import {
    MULTISIG_PROVIDERS,
} from '../../../lib/constants/multisigConstants';
import SignChallengeWithVault from './SignChallengeWithVault/SignChallengeWithVault';
import SignChallengeManually from './SignChallengeManually/SignChallengeManually';

const SignChallengeBlock = ({ d, signedChallengeResolver, challengeTx }) => {
    const { multisigProvider } = d.multisig;
    const isVault = multisigProvider === MULTISIG_PROVIDERS.LOBSTR_VAULT;

    if (isVault) {
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
