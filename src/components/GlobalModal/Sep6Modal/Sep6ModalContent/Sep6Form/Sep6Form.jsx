import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import FeeBlock from '../../Common/FeeBlock';
import Driver from '../../../../../lib/driver/Driver';
import FieldGenerator from '../FieldGenerator/FieldGenerator';

export default class Sep6Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            assetInfo: this.props.assetInfo,
            withdrawParams: {
                wallet_name: 'StellarTerm',
                wallet_url: 'https://stellarterm.com',
                asset_code: this.props.asset.code,
                account: this.props.d.session.account.accountId(),
            },
        };
    }

    componentWillMount() {
        const { fields, types } = this.props.assetInfo;
        if (types === undefined && fields === undefined) {
            return;
        }

        if (!this.props.isDeposit) {
            this.onUpdateWithdrawParams({ type: Object.keys(types)[0] }, true);
        }
    }

    onUpdateWithdrawParams(params, isError) {
        this.setState({ withdrawParams: Object.assign(this.state.withdrawParams, params) });
        this.props.onUpdateForm(this.state.withdrawParams, isError);
    }

    getFormFields() {
        const { d, isDeposit, asset, min, max } = this.props;
        const { fields, types } = this.props.assetInfo;

        if ((types === undefined && !isDeposit) || (fields === undefined && isDeposit)) {
            return;
        }

        const defaultFields = { amount: { optional: false }, dest: { optional: false } };
        const infoFields = isDeposit ? fields : types[this.state.withdrawParams.type].fields;

        let fieldsData = infoFields === undefined ? defaultFields : infoFields;
        if (!isDeposit && !_.has(infoFields, 'amount')) {
            fieldsData = Object.assign({ amount: { optional: false } }, fieldsData);
        }

        if (_.has(fieldsData, 'asset_code')) {
            delete fieldsData.asset_code;
        }

        return (
            <FieldGenerator
                d={d}
                min={min}
                max={max}
                asset={asset}
                fields={fieldsData}
                isDeposit={isDeposit}
                type={this.state.withdrawParams.type}
                onUpdateWithdrawParams={(params, isError) => this.onUpdateWithdrawParams(params, isError)} />
        );
    }

    generateTypesButtons() {
        const { assetInfo, withdrawParams } = this.state;
        const isOneWithdrawType = Object.keys(assetInfo.types).length <= 1;

        return isOneWithdrawType ? null : (
            <div className="content_block">
                <div className="content_title">Withdraw to</div>
                <div className="content_withdraw_types">
                    <div className="s-buttonGroup">
                        {Object.keys(assetInfo.types).map((supportedType) => {
                            const buttonClass = `s-button ${
                                supportedType === withdrawParams.type ? 's-button-active' : ''
                            }`;
                            const typeButtonText = supportedType.replace(/_/g, ' ');

                            return (
                                <button
                                    className={buttonClass}
                                    key={supportedType}
                                    onClick={() => this.onUpdateWithdrawParams({ type: supportedType }, true)}>
                                    {typeButtonText}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { withdrawParams } = this.state;
        const { asset, feeFixed, feePercent, isDeposit } = this.props;

        return (
            <React.Fragment>
                {isDeposit ? null : this.generateTypesButtons()}

                {this.getFormFields()}

                <div className="transaction_info">
                    <FeeBlock
                        feeFixed={feeFixed}
                        feePercent={feePercent}
                        assetCode={asset.code}
                        amountForFee={!withdrawParams.amount ? 0 : parseFloat(withdrawParams.amount)} />
                </div>
            </React.Fragment>
        );
    }
}

Sep6Form.propTypes = {
    isDeposit: PropTypes.bool.isRequired,
    onUpdateForm: PropTypes.func.isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    assetInfo: PropTypes.objectOf(PropTypes.any),
    asset: PropTypes.objectOf(PropTypes.any).isRequired,
    min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    feeFixed: PropTypes.number.isRequired,
    feePercent: PropTypes.number.isRequired,
};
