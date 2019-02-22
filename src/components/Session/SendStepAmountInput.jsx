import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';

export default function SendStepAmountInput(props) {
    const { amount, isValid, userBalance, validationMessage } = props;
    const { handlers } = props.d.send;

    return (
        <div className="Send__content">
            <label className="s-inputGroup Send__input" htmlFor="inputSendAmount">
                <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
                    <span>Amount</span>
                </span>

                <input
                    className="s-inputGroup__item S-flexItem-share"
                    name="inputSendAmount"
                    type="text"
                    value={amount}
                    onChange={handlers.updateAmount}
                    placeholder="Amount to send..." />
            </label>

            {userBalance}
            {validationMessage}

            <div className="Send__panel__next">
                <button className="s-button" disabled={!isValid} onClick={handlers.step3Next}>
                    Save and continue
                </button>
            </div>
        </div>
    );
}

SendStepAmountInput.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    amount: PropTypes.string.isRequired,
    userBalance: PropTypes.element,
    isValid: PropTypes.bool,
    validationMessage: PropTypes.element,
};
