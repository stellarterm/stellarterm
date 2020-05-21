import React from 'react';
import PropTypes from 'prop-types';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../../../lib/Driver';
import Validate from '../../../../../lib/Validate';

export default class SendDest extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errorMsg: this.getErrorMessage(),
        };
    }

    onChangeDest(e) {
        this.setState({ errorMsg: null });
        this.props.d.send.updateDestination(e.target.value);
    }

    onFocusLeave() {
        this.setState({ errorMsg: this.getErrorMessage() });
    }

    getErrorMessage() {
        const { federationNotFound, destInput, accountId } = this.props.d.send;
        const isDestFederation = Validate.address(destInput).ready;

        const sendingYourself =
            (isDestFederation && accountId === this.props.d.session.account.account_id) ||
            (destInput === this.props.d.session.account.account_id);
        const notValidDestination = Validate.publicKey(destInput).message && Validate.address(destInput).message;

        if (notValidDestination) {
            return 'Stellar or federation address is invalid';
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
        const {
            accountId,
            destInput,
            federationAddress,
            federationNotFound,
            federationResolving } = this.props.d.send;

        if (!federationAddress) { return null; }

        const identiconImg = createStellarIdenticon(accountId).toDataURL();
        const isDestFederation = Validate.address(destInput).ready && !federationNotFound && !federationResolving;
        const isDestPublicKey = Validate.publicKey(destInput).ready;

        return isDestFederation || isDestPublicKey ? (
            <div className="field_description">
                <span>resolved to </span>
                <img src={identiconImg} alt="identicon" className="identicon_resolved" />
                <span className="publicKey_resolved">
                    {isDestFederation ? accountId : null}
                    {isDestPublicKey ? federationAddress : null}
                </span>
            </div>
        ) : null;
    }

    render() {
        const { errorMsg } = this.state;
        const recipientName = this.props.d.send.destinationName;

        return (
            <div className="Send_input_block">
                <label htmlFor="recipient">Recipient {recipientName}</label>
                {errorMsg ? <div className="invalidValue_popup">{errorMsg}</div> : null}

                <input
                    autoFocus
                    value={this.props.d.send.destInput}
                    onChange={e => this.onChangeDest(e)}
                    onBlur={() => this.onFocusLeave()}
                    maxLength="56"
                    type="text"
                    name="recipient"
                    placeholder="Enter Stellar or federation address" />

                {this.getInputNotice()}
            </div>
        );
    }
}

SendDest.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
