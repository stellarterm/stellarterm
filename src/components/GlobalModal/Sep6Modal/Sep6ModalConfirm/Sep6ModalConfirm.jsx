/* eslint-disable camelcase */
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import FeeBlock from '../Common/FeeBlock';
import ExtraInfoBlock from '../Common/ExtraInfoBlock';
import EstimatedTime from '../Common/EstimatedTIme';
import Driver from '../../../../lib/driver/Driver';
import Sep6ModalFooter from '../Common/Sep6ModalFooter/Sep6ModalFooter';
import MemoBlock from '../Common/MemoBlock';
import MinMaxAmount from '../Common/MinMaxAmount';

export default class Sep6ModalConfirm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            res: this.props.confirmData,
        };
    }

    renderWithdrawInfo() {
        const { res } = this.state;
        const { asset, isDeposit } = this.props;

        return (
            <div className="content_main">
                <div className="content_block">
                    <div className="content_title">Your {asset.code} address</div>
                    <div className="content_text">{res.dest}</div>
                </div>

                <div className="content_block">
                    <div className="content_title">Amount you {isDeposit ? 'deposit' : 'withdraw'}</div>
                    <div className="content_text">{res.amount} {asset.code}</div>
                </div>

                <FeeBlock
                    feeFixed={parseFloat(res.fee_fixed) || 0}
                    feePercent={parseFloat(res.fee_percent) || 0}
                    assetCode={asset.code}
                    amountForFee={parseFloat(res.amount)}
                />

                <div className="content_block">
                    <div className="content_title">Anchors address</div>
                    <div className="content_text">{res.account_id}</div>
                </div>

                <MemoBlock memo={res.memo || ''} memoType={res.memo_type || ''} />

                <EstimatedTime time={res.eta} isDeposit={isDeposit} />

                <ExtraInfoBlock extra={_.has(res, 'extra_info') && res.extra_info !== null ? res.extra_info : ''} />
            </div>
        );
    }

    renderDepositInfo() {
        const { res } = this.state;
        const { asset, isDeposit } = this.props;

        return (
            <div className="content_main">
                <div className="content_block">
                    <div className="content_title">Deposit address or instructions</div>
                    <div className="content_text">{res.how || 'No instructions'}</div>
                </div>

                <MinMaxAmount minLimit={res.min_amount || ''} maxLimit={res.max_amount || ''} assetCode={asset.code} isDeposit />

                <EstimatedTime time={res.eta} isDeposit={isDeposit} />

                <FeeBlock
                    feeFixed={parseFloat(res.fee_fixed) || 0}
                    feePercent={parseFloat(res.fee_percent) || 0}
                    assetCode={asset.code}
                    amountForFee={parseFloat(res.amount)}
                />

                <ExtraInfoBlock extra={_.has(res, 'extra_info') && res.extra_info !== null ? res.extra_info : ''} />
            </div>
        );
    }

    render() {
        const { d, asset, isDeposit, confirmData } = this.props;

        return (
            <React.Fragment>
                {isDeposit ? this.renderDepositInfo() : this.renderWithdrawInfo()}

                <Sep6ModalFooter
                    d={d}
                    asset={asset}
                    isDeposit={isDeposit}
                    transferServer={this.props.transferServer}
                    isAnyError={false}
                    isLoading={false}
                    needConfirm
                    sendData={confirmData}
                />
            </React.Fragment>
        );
    }
}

Sep6ModalConfirm.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    isDeposit: PropTypes.bool.isRequired,
    confirmData: PropTypes.objectOf(PropTypes.any).isRequired,
    asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])).isRequired,
    transferServer: PropTypes.objectOf(PropTypes.any),
};
