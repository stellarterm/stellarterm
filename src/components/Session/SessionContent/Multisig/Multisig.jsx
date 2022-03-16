import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/driver/Driver';
import MultisigDisabled from './MultisigDisabled/MultisigDisabled';
import MultisigEnabled from './MultisigEnabled/MultisigEnabled';


export default function Multisig({ d }) {
    return d.multisig.isMultisigEnabled ? <MultisigEnabled d={d} /> : <MultisigDisabled d={d} />;
}
Multisig.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
