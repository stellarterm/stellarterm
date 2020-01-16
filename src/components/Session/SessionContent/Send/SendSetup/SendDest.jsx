import React from 'react';
import PropTypes from 'prop-types';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../../../lib/Driver';
import Validate from '../../../../../lib/Validate';

export default class SendDest extends React.Component {
    getErrorMessage() {
        const { federationNotFound, destInput, accountId } = this.props.d.send;
        const isDestFederation = Validate.address(destInput).ready;

        const sendingYourself =
            (isDestFederation && accountId === this.props.d.session.account.account_id) ||
            (destInput === this.props.d.session.account.account_id);
        const notValidDestination = Validate.publicKey(destInput).message && Validate.address(destInput).message;

        if (notValidDestination) {
            return 'Stellar address or account ID is invalid';
        }
        if (federationNotFound) {
            return <span>Unable to resolve federation address {<strong>{destInput}</strong>}</span>;
        }
        if (sendingYourself) {
            return <strong>Warning: you are sending to yourself!</strong>;
        }

        return null;
    }

    getInputNotice() {
        const { federationAddress, accountId, destInput } = this.props.d.send;

        if (!federationAddress) { return null; }

        const identiconImg = createStellarIdenticon(accountId).toDataURL();
        const isDestFederation = Validate.address(destInput).ready;
        const isDestPublicKey = Validate.publicKey(destInput).ready;

        return (
            <div className="field_description">
                <span>resolved to </span>
                <img src={identiconImg} alt="identicon" className="identicon_resolved" />
                <span className="publicKey_resolved">
                    {isDestFederation ? accountId : null}
                    {isDestPublicKey ? federationAddress : null}
                </span>
            </div>
        );
    }

    render() {
        const { destInput, updateDestination } = this.props.d.send;
        const errorMsg = this.getErrorMessage();
        const inputNotice = this.getInputNotice();

        return (
            <div className="Send_input_block">
                <label htmlFor="recipient">Recipient</label>
                {errorMsg ? <div className="invalidValue_popup">{errorMsg}</div> : null}

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
