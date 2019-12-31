import React from 'react';
import PropTypes from 'prop-types';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../../../lib/Driver';
import Validate from '../../../../../lib/Validate';

export default class SendDest extends React.Component {
    getInputNotice() {
        const { federationAddress, accountId, federationNotFound, destInput } = this.props.d.send;

        const sendingYourself = destInput === this.props.d.session.account.account_id;
        const notValidDestination = Validate.publicKey(destInput).message && Validate.address(destInput).message;

        let errorMessage;

        if (notValidDestination) {
            errorMessage = 'Stellar address or account ID is invalid.';
        }
        if (federationNotFound) {
            errorMessage = <span>Unable to resolve federation address {<strong>{destInput}</strong>}</span>;
        }
        if (federationAddress) {
            const identiconImg = createStellarIdenticon(accountId).toDataURL();
            const isDestFederation = Validate.address(destInput).ready;
            const isDestPublicKey = Validate.publicKey(destInput).ready;

            errorMessage = (
                <React.Fragment>
                    <span>resolved to <img src={identiconImg} alt="identicon" className="identicon_resolved" /></span>
                    <span className="publicKey_resolved">
                        {isDestFederation ? accountId : null}
                        {isDestPublicKey ? federationAddress : null}
                    </span>
                </React.Fragment>
            );
        }
        if (sendingYourself) {
            errorMessage = <strong>Warning: You are sending to yourself!</strong>;
        }

        return <div className="field_description">{errorMessage}</div>;
    }

    render() {
        const { destInput, updateDestination } = this.props.d.send;
        const inputNotice = this.getInputNotice();

        return (
            <div className="Send_input_block">
                <label htmlFor="recipient">Recipient</label>
                <input
                    autoFocus
                    value={destInput}
                    onChange={e => updateDestination(e.target.value)}
                    maxLength="56"
                    type="text"
                    name="recipient"
                    placeholder="Stellar or federation address" />

                {inputNotice}
            </div>
        );
    }
}

SendDest.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
