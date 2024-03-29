import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/driver/Driver';


export default class MultisigDisabled extends React.Component {
    multisigEnable() {
        this.props.d.modal.handlers.activate('multisigEnableStep1', this.props.d);
    }
    render() {
        return (
            <div className="MultisigDisabled">
                <div className="MultisigDisabled_wrapper">
                    <div className="MultisigDisabled_content">
                        <h1>Multisignature disabled</h1>
                        <span>
                            Multisignature improves your wallet {''}
                            security by requiring additional approvals for each transaction.
                        </span>
                        <a
                            href="https://lobstrvault.freshdesk.com/support/solutions/151000012441"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                        Read more about multisig
                        </a>
                    </div>
                    <button className="s-button" onClick={() => this.multisigEnable()}>Enable</button>
                </div>
            </div>
        );
    }
}
MultisigDisabled.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
