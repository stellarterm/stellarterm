import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Driver from '../../../lib/Driver';
import Sep6ModalContent from './Sep6ModalContent/Sep6ModalContent';
import AssetBalance from './AssetBalance/AssetBalance';
import Sep6ModalConfirm from './Sep6ModalConfirm/Sep6ModalConfirm';
import WithdrawCompleted from './WithdrawCompleted/WithdrawCompleted';

export default class Sep6Modal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDeposit: this.props.data.isDeposit,
            isConfirmModal: this.props.data.isConfirm,
            isWithdrawCompleted: this.props.data.withdrawCompleted,
            confirmData: this.props.data.confirmData,
        };
    }

    getMainModalContent() {
        const { isDeposit, isConfirmModal, confirmData } = this.state;
        const { data, d } = this.props;

        return isConfirmModal ? (
            <div className="Sep6Modal_content">
                <AssetBalance d={d} asset={data.asset} isDeposit={isDeposit} isConfirmModal />

                <Sep6ModalConfirm d={d} isDeposit={isDeposit} confirmData={confirmData} asset={data.asset} />
            </div>
        ) : (
            <div className="Sep6Modal_content">
                <AssetBalance d={d} asset={data.asset} isDeposit={isDeposit} />

                <Sep6ModalContent d={d} isDeposit={isDeposit} asset={data.asset} jwtToken={data.jwtToken || null} />
            </div>
        );
    }

    getWithdrawCompletedContent() {
        const { isDeposit } = this.state;
        const { d, data } = this.props;

        return (
            <div className="Sep6Modal_content">
                <WithdrawCompleted d={d} asset={data.asset} isDeposit={isDeposit} withdrawAmount={data.amount} />
            </div>
        );
    }

    render() {
        const { isDeposit, isWithdrawCompleted } = this.state;
        const { data, d } = this.props;

        return (
            <div className="Sep6Modal">
                <div className="Modal_header">
                    <span>
                        {isDeposit ? 'Deposit' : 'Withdraw'} {data.asset.code} asset
                    </span>
                    <img
                        src={images['icon-close']}
                        alt="X"
                        onClick={() => {
                            d.modal.handlers.cancel();
                            window.history.pushState({}, null, '/');
                        }} />
                </div>

                {isWithdrawCompleted ? this.getWithdrawCompletedContent() : this.getMainModalContent()}
            </div>
        );
    }
}
Sep6Modal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    data: PropTypes.objectOf(PropTypes.any),
};
