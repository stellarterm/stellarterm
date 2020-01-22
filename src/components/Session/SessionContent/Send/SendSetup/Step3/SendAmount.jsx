import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../../../../lib/Driver';
import Validate from '../../../../../../lib/Validate';
import SendEditLink from '../Common/SendEditLink';
import SendAmountInput from './SendAmountInput/SendAmountInput';

export default class SendAmount extends React.Component {
    getAsset() {
        const { asset } = this.props.d.send.step2.availability;
        return new StellarSdk.Asset(asset.code, asset.issuer);
    }

    getMaxAssetSpend(assetBalance) {
        const { account } = this.props.d.session;
        const openOrdersSum = account.getReservedBalance(this.getAsset());
        const maxLumenSpend = account.maxLumenSpend();

        const targetCurrency = assetBalance || maxLumenSpend;
        return parseFloat(targetCurrency) > parseFloat(openOrdersSum) ? (targetCurrency - openOrdersSum).toFixed(7) : 0;
    }

    getStepContent() {
        const { d, isCurrentStep, stepIsPassed } = this.props;
        const { amount } = this.props.d.send.step3;

        if (stepIsPassed) {
            return this.stepPassedContent();
        } else if (!isCurrentStep) {
            return null;
        }

        const { account } = d.session;
        const { asset } = d.send.step2.availability;

        const maxLumenSpend = this.getMaxAssetSpend();
        const isXlmNative = asset.code === 'XLM' && asset.issuer === undefined;
        const notEnoughBalance = Number(amount) > Number(maxLumenSpend);

        let amountValid = Validate.amount(amount);
        let validationMessage;
        let userBalance;

        if (amountValid === false) {
            validationMessage = <p>Amount is invalid</p>;
        } else if (asset !== null) {
            const targetBalance = account.getBalance(this.getAsset());
            const targetBalanceIsNotNull = targetBalance !== null;
            const maxAssetSpend = this.getMaxAssetSpend(targetBalance);
            const notEnoughAsset = Number(amount) > Number(maxAssetSpend);

            userBalance = targetBalanceIsNotNull ? (<p>You have {targetBalance} {asset.code}.</p>) : null;

            if (isXlmNative && notEnoughBalance) {
                amountValid = false;
                validationMessage = (
                    <p>
                        You may only send up to <strong>{maxLumenSpend} lumens</strong> due to the minimum balance
                        requirements and open orders.<br />
                        For more information, see the <Link to="/account/">minimum balance tool</Link>.
                    </p>
                );
            } else if (notEnoughAsset) {
                amountValid = false;
                validationMessage = (
                    <p>
                        You may only send up to <strong>{maxAssetSpend} {asset.code}</strong> due to the
                         minimum balance or open offers.
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
