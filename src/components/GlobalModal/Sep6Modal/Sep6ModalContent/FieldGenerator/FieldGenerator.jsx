import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import MinMaxAmount from '../../Common/MinMaxAmount';
import Driver from '../../../../../lib/driver/Driver';

const regexp = new RegExp(/^(\d{0,15})([.]\d{1,7})?$/);
const fieldsDisplayNames = new Map([['dest', 'destination'], ['dest_extra', 'destination extra']]);

export default class FieldGenerator extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fields: this.fieldConverter(this.props.fields),
        };
    }

    componentDidUpdate(oldProps) {
        const { isDeposit } = this.props;
        if (oldProps.type !== this.props.type && !isDeposit) {
            this.setState({ fields: this.fieldConverter(this.props.fields) });
        }
    }

    onChangeAmount(value) {
        const valueToSet = value.replace(/,/g, '.');
        const isTheOnlyDot = valueToSet.split('.').length === 2;
        const isAmountValid = valueToSet.slice(-1) === '.' && valueToSet.slice(-2) !== '..' && isTheOnlyDot;

        if (isAmountValid || regexp.test(valueToSet)) {
            this.checkForAmountError(valueToSet);
        }
        this.checkAllFieldsValid();
    }

    getInputLabel(field, fieldName) {
        const { optional } = this.state.fields[field];

        return (
            <React.Fragment>
                <label className="withdraw_label" htmlFor="amount">
                    {fieldName} {optional ? '' : '*'}
                </label>
                <div className="invalidValue_popup">{this.state.fields[field].inputErrorMsg}</div>
            </React.Fragment>
        );
    }

    getFieldParams(field) {
        const { fields } = this.props;
        const { asset, isDeposit } = this.props;

        const actionText = isDeposit ? 'deposit' : 'withdraw';
        const defaultFieldDesc = new Map([
            ['amount', `${asset.code} amount you want to ${actionText}`],
            ['dest', `${asset.code} destination address`],
        ]);

        const fieldParams = fields[field];
        const noDescProvided = defaultFieldDesc.has(field) && fields[field].description === undefined;

        const isOptionalField = fields[field].optional === undefined && field !== 'dest' ? true : fields[field].optional;
        const fieldDescription = noDescProvided ? defaultFieldDesc.get(field) : fields[field].description;

        return Object.assign(fieldParams, {
            optional: isOptionalField,
            description: fieldDescription,
            inputValue: '',
            isInputError: !isOptionalField,
            inputErrorMsg: '',
        });
    }

    getAmountField() {
        const { amount } = this.state.fields;
        const { asset, min, max } = this.props;

        return (
            <div className="withdraw_input_content" key="amount">
                {this.getInputLabel('amount', 'amount')}
                <div className="withdraw_input_block">
                    <input
                        type="text"
                        name="amount"
                        value={amount.inputValue}
                        onChange={e => this.onChangeAmount(e.target.value)}
                        placeholder="Enter amount"
                        autoComplete="off"
                        autoFocus />
                    <div className="withdraw_code">{asset.code}</div>
                </div>

                <div className="input_additional_info">
                    <span>{amount.description}</span>
                </div>

                <MinMaxAmount minLimit={min || ''} maxLimit={max || ''} assetCode={asset.code} withdrawFormLabel />
            </div>
        );
    }

    getOtherFields(field) {
        const { fields } = this.state;
        const fieldName = fieldsDisplayNames.has(field) ? fieldsDisplayNames.get(field) : field.replace(/_/g, ' ');
        const isSelectField = _.has(fields[field], 'choices');

        return (
            <div className="withdraw_input_content" key={fieldName}>
                {this.getInputLabel(field, fieldName)}

                <div className="withdraw_input_block">
                    {isSelectField ? (
                        <select
                            value={fields[field].inputValue}
                            onChange={e => this.checkForRequiredField(e.target.value, field)}
                            onBlur={e => this.checkForRequiredField(e.target.value, field)}>
                            <option defaultValue disabled hidden value="" key={'-----'}>
                                -----
                            </option>

                            {fields[field].choices.map(choice => (
                                <option value={choice} key={choice}>
                                    {choice}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            name={fieldName}
                            value={fields[field].inputValue}
                            placeholder={`Enter ${fieldName}`}
                            onChange={e => this.checkForRequiredField(e.target.value, field)}
                            autoComplete="off" />
                    )}
                </div>

                <div className="input_additional_info">
                    <span>{fields[field].description}</span>
                </div>
            </div>
        );
    }

    checkForRequiredField(value, field) {
        const { fields } = this.state;
        const isError = value === '' && !fields[field].optional;

        Object.assign(fields[field], {
            inputValue: value,
            isInputError: isError,
            inputErrorMsg: isError ? 'This field is required!' : '',
        });

        this.setState({ fields });
        this.checkAllFieldsValid();
    }

    checkAllFieldsValid() {
        const isAnyFieldErrors = Object.values(this.state.fields)
            .map(el => el.isInputError)
            .some(isError => isError === true);

        const paramsObj = Object.keys(this.state.fields).reduce(
            (result, field) => Object.assign({}, result, { [field]: this.state.fields[field].inputValue }),
            {},
        );

        this.props.onUpdateWithdrawParams(paramsObj, isAnyFieldErrors);
    }

    checkForAmountError(value) {
        const { d, asset, min, max, isDeposit } = this.props;
        const { fields } = this.state;

        const amountField = { inputValue: value, isInputError: false, inputErrorMsg: '' };

        const parsedAmount = parseFloat(value);
        const assetBalance = parseFloat(
            d.session.account
                .getSortedBalances()
                .find(balance => balance.code === asset.code && balance.issuer === asset.issuer).balance,
        );

        if (value === '' && !fields.amount.optional) {
            amountField.inputErrorMsg = 'This field is required';
        } else if (parsedAmount > assetBalance && !isDeposit) {
            amountField.inputErrorMsg = `You can't ${isDeposit ? 'deposit' : 'withdraw'} more than ${assetBalance} ${asset.code}`;
        } else if (parsedAmount < min && min !== '') {
            amountField.inputErrorMsg = `Minimum ${isDeposit ? 'deposit' : 'withdrawal'} amount is ${min} ${asset.code}`;
        } else if (parsedAmount > max && max !== '') {
            amountField.inputErrorMsg = `Maximum ${isDeposit ? 'deposit' : 'withdrawal'} amount is ${max} ${asset.code}`;
        }

        amountField.isInputError = Boolean(amountField.inputErrorMsg);
        const newAmountField = Object.assign(fields.amount, amountField);
        this.setState(Object.assign(this.state.fields, { amount: newAmountField }));
    }

    fieldConverter(fields) {
        return Object.keys(fields).reduce(
            (result, field) => Object.assign({}, result, { [field]: this.getFieldParams(field) }),
            {},
        );
    }

    render() {
        const { fields } = this.state;

        const generatedInputs = Object.keys(fields).map((field) => {
            if (field === 'amount') {
                return this.getAmountField();
            }
            return this.getOtherFields(field);
        });

        return <div className="content_block">{generatedInputs}</div>;
    }
}

FieldGenerator.propTypes = {
    type: PropTypes.string,
    isDeposit: PropTypes.bool.isRequired,
    onUpdateWithdrawParams: PropTypes.func.isRequired,
    fields: PropTypes.objectOf(PropTypes.any).isRequired,
    asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
