import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import directory from 'stellarterm-directory';
import Driver from '../../../../../lib/Driver';
import images from '../../../../../images';

export default class AssetActionButtons extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false,
        };
    }

    onSep6Click(isDeposit) {
        const { d, asset } = this.props;
        const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);

        d.modal.handlers.activate('Sep6Modal', {
            isDeposit,
            asset: directoryAsset,
        });
    }

    render() {
        const { onlyIcons, asset } = this.props;

        const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);
        const isDepositEnabled = directoryAsset !== null && directoryAsset.deposit === true;
        const isWithdrawEnabled = directoryAsset !== null && directoryAsset.withdraw === true;

        const containerClass = `ActionBtns_container ${onlyIcons ? 'hide_ActionText' : ''}`;

        return (
            <div className={containerClass}>
                {isDepositEnabled ? (
                    <div className="actionBtn" onClick={() => this.onSep6Click(true)}>
                        <div className="btnHint">Deposit</div>
                        <img className="actionBtn_icon" src={images['icon-deposit']} alt="deposit" />
                        <span className="actionBtn_text">Deposit</span>
                    </div>
                ) : null}

                {isWithdrawEnabled ? (
                    <div className="actionBtn" onClick={() => this.onSep6Click(false)}>
                        <div className="btnHint">Withdraw</div>
                        <img className="actionBtn_icon" src={images['icon-withdraw']} alt="withdraw" />
                        <span className="actionBtn_text">Withdraw</span>
                    </div>
                ) : null}

                <Link to={'send/'}>
                    <div className="actionBtn">
                        <div className="btnHint">Send</div>
                        <img className="actionBtn_icon" src={images['icon-send']} alt="send" />
                        <span className="actionBtn_text">Send</span>
                    </div>
                </Link>

                {asset.tradeLink ? (
                    <Link to={asset.tradeLink}>
                        <div className="actionBtn">
                            <div className="btnHint">Trade</div>
                            <img className="actionBtn_icon" src={images['icon-trade']} alt="trade" />
                            <span className="actionBtn_text">Trade</span>
                        </div>
                    </Link>
                ) : null}
            </div>
        );
    }
}

AssetActionButtons.propTypes = {
    d: PropTypes.instanceOf(Driver),
    onlyIcons: PropTypes.bool,
    asset: PropTypes.objectOf(PropTypes.any),
};
