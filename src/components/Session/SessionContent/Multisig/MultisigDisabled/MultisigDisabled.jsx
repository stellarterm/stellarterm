import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';


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
                            href="https://lobstr.zendesk.com/hc/en-us/categories/360001534333-LOBSTR-Vault"
                            target="_blank">
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
