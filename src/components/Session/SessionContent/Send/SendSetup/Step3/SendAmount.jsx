import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';
import Validate from '../../../../../../lib/Validate';
import SendAmountInput from './SendAmountInput/SendAmountInput';
import SendEditLink from '../Common/SendEditLink';

export default class SendAmount extends React.Component {
    getStepContent() {
        const { d, isCurrentStep, stepIsPassed } = this.props;
        const { amount } = this.props.d.send.step3;

        if (stepIsPassed) {
            return this.stepPassedContent();
        } else if (isCurrentStep) {
            const { asset } = d.send.step2.availability;
            const { account } = d.session;
            const maxLumenSpend = account.maxLumenSpend();

            const isXlmNative = asset.code === 'XLM' && asset.issuer === undefined;
            const notEnoughBalance = Number(amount) > Number(account.maxLumenSpend());
            let amountValid = Validate.amount(amount);
            let validationMessage;
            let userBalance;

            if (amountValid === false) {
                validationMessage = <p>Amount is invalid</p>;
            } else if (asset !== null) {
                const targetBalance = account.getBalance(new StellarSdk.Asset(asset.code, asset.issuer));
                const targetBalanceIsNotNull = targetBalance !== null;

                userBalance = targetBalanceIsNotNull ? (<p>You have {targetBalance} {asset.code}.</p>) : null;

                if (isXlmNative && notEnoughBalance) {
                    amountValid = false;
                    validationMessage = (
                        <p>
                            You may only send up to <strong>{maxLumenSpend} lumens</strong> due to the minimum balance
                            requirements. For more information, see the <a href="#account">minimum balance tool</a>.
                        </p>
                    );
                }
            }

            return (
                <SendAmountInput
                    d={d}
                    amount={amount}
                    isValid={amountValid}
                    userBalance={userBalance}
                    validationMessage={validationMessage} />
            );
        }
        return null;
    }

    stepPassedContent() {
        const { amount } = this.props.d.send.step3;

        return (
            <div className="Send__content Send__overview">
                <p className="Send__overviewLine">
                    Amount:{' '}
                    <strong>
                        {amount} {this.props.d.send.step2.availability.asset.getCode()}
                    </strong>
                </p>
            </div>
        );
    }

    render() {
        const { d, isCurrentStep, stepIsPassed } = this.props;
        const { step3Edit } = d.send.handlers;
        const stepContent = this.getStepContent();

        return (
            <div className={`Send__panel${!isCurrentStep && !stepIsPassed ? ' is-future' : ''}`}>
                <h3 className={`Send__title${isCurrentStep ? ' is-active' : ''}`}>
                    3. Amount <SendEditLink stepIsPassed={stepIsPassed} editStep={step3Edit} />
                </h3>
                {stepContent}
            </div>
        );
    }
}

SendAmount.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    isCurrentStep: PropTypes.bool.isRequired,
    stepIsPassed: PropTypes.bool.isRequired,
};
