import React from 'react';
import PropTypes from 'prop-types';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../../../lib/Driver';
import Validate from '../../../../../lib/Validate';

export default class SendDest extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showError: false,
        };
    }

    onChangeDest(e) {
        this.setState({ showError: false });
        this.props.d.send.updateDestination(e.target.value);
    }

    onFocusLeave() {
        this.setState({ showError: true });
    }

    getErrorMessage() {
        const { federationNotFound, destInput, accountId } = this.props.d.send;
        const isDestFederation = Validate.address(destInput).ready;

        const sendingYourself =
            (isDestFederation && accountId === this.props.d.session.account.account_id) ||
            (destInput === this.props.d.session.account.account_id);
        const notValidDestination = Validate.publicKey(destInput).message &&
            Validate.muxedKey(destInput).message && Validate.address(destInput).message;

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

    getErrorTooltip() {
        const message = this.getErrorMessage();
        if (!message) { return null; }
        return <div className="invalidValue_popup">{message}</div>;
    }

    getInputNotice() {
        const {
            accountId,
            destInput,
            federationAddress,
            federationNotFound,
            requestIsPending,
        } = this.props.d.send;

        if (!federationAddress) { return null; }

        const identiconImg = createStellarIdenticon(accountId).toDataURL();
        const isDestFederation = Validate.address(destInput).ready && !federationNotFound && !requestIsPending;
        const isDestPublicKey = Validate.publicKey(destInput).ready;

        return isDestFederation || isDestPublicKey ? (
            <div className="field_description">
                <span>resolved to</span>
                <img src={identiconImg} alt="identicon" className="identicon_resolved" />
                <span className="publicKey_resolved">
                    {isDestFederation ? accountId : null}
                    {isDestPublicKey ? federationAddress : null}
                </span>
            </div>
        ) : null;
    }

    render() {
        const { showError } = this.state;
        const { destinationName, requestIsPending } = this.props.d.send;

        return (
            <div className="Send_input_block">
                <label htmlFor="recipient">Recipient {destinationName}</label>
                {showError && this.getErrorTooltip()}

                <div className="Send_dest_input">
                    <input
                        autoFocus
                        value={this.props.d.send.destInput}
                        onChange={e => this.onChangeDest(e)}
                        onBlur={() => this.onFocusLeave()}
                        maxLength="69"
                        type="text"
                        name="recipient"
                        placeholder="Enter Stellar or federation address"
                    />
                    {requestIsPending &&
                        <div className="Send_loader nk-spinner-green">
                            <div className="nk-spinner" />
                        </div>
                    }
                </div>

                {this.getInputNotice()}
            </div>
        );
    }
}

SendDest.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
