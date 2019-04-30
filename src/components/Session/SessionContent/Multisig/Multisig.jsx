import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import MultisigDisabled from './MultisigDisabled/MultisigDisabled';
import MultisigEnabled from './MultisigEnabled/MultisigEnabled';


export default function Multisig(props) {
    const { signers } = props.d.session.account;
    if (signers.length === 1) {
        return (
            <MultisigDisabled d={props.d} />
        );
    }
    return (
        <MultisigEnabled d={props.d} />
    );
}
Multisig.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
