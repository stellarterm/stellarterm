import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';
import Validate from '../../../../../../lib/Validate';

export default class SendDestInput extends React.Component {
    getInputNotice() {
        const { address, accountId, addressNotFound, step1 } = this.props.d.send;

        const sendingYourself = step1.destInput === this.props.d.session.account.account_id;
        const destError = Validate.publicKey(step1.destInput).message && Validate.address(step1.destInput).message;

        if (destError) { return <p>Stellar address or account ID is invalid.</p>; }

        if (address) {
            return (
                <p className="Send__federationNotice">
                    <strong>{address}</strong> resolved to <strong>{accountId}</strong>
                </p>
            );
        }
        if (addressNotFound) {
            return (
                <p className="Send__federationNotice">
                    Unable to resolve address <strong>{step1.destInput}</strong>
                </p>
            );
        }
        if (sendingYourself) {
            return (
                <div className="s-alert s-alert--warning">
                    <strong>Warning: You are sending to yourself!</strong>
                </div>
            );
        }

        return null;
    }

    render() {
        const { step1, handlers } = this.props.d.send;
        const inputNotice = this.getInputNotice();

        return (
            <React.Fragment>
                <label className="s-inputGroup Send__input" htmlFor="inputDestSend">
                    <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
                        <span>Destination</span>
                    </span>
                    <input
                        className="s-inputGroup__item S-flexItem-share"
                        name="inputDestSend"
                        type="text"
                        value={step1.destInput}
                        onChange={handlers.updateDestination}
                        placeholder="example: username*getstargazer.com or
                GC4DJYMFQZVX3R56FVCN3WA7FJFKT24VI67ODTZUENSE4YNUXZ3WYI7R" />
                </label>
                {inputNotice}
            </React.Fragment>
        );
    }
}

SendDestInput.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
