import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as StellarSdk from 'stellar-sdk';
import directory from 'stellarterm-directory';
import Driver from '../../../../../lib/Driver';
import images from '../../../../../images';
import Stellarify from '../../../../../lib/Stellarify';
import { getTransferDomain, checkAssetSettings, getTransferServer } from '../../../../../lib/SepUtils';

export default class AssetActionButtons extends React.Component {
    static getBuyLumensLink(isXLMNative) {
        if (!isXLMNative) {
            return null;
        }

        return (
            <Link to="/buy-crypto?code=xlm">
                <div className="actionBtn">
                    <div className="btnHint btnHint_wide">Buy lumens</div>
                    <img className="actionBtn_icon" src={images['icon-deposit']} alt="withdraw" />
                </div>
            </Link>
        );
    }

    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false,
        };
    }

    async onSepClick(isDeposit) {
        const { d, asset } = this.props;
        const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);

        const transferServer = await getTransferServer(directoryAsset, isDeposit ? 'deposit' : 'withdraw', d.modal);

        if (transferServer === 'cancelled') {
            return;
        }

        if (!transferServer) {
            d.toastService.error(
                `${isDeposit ? 'Deposits' : 'Withdrawals'} not available`,
                `${asset.code} ${isDeposit ? 'deposits' : 'withdrawals'} not available at the moment. Try back later.`,
            );
            return;
        }

        d.modal.handlers.activate(`Sep${transferServer.IS_SEP24 ? '24' : '6'}Modal`, {
            isDeposit,
            asset: directoryAsset,
            transferServer,
        });
    }

    async onHistoryClick() {
        const { d, asset } = this.props;
        const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);

        const { output } = await getTransferDomain(directoryAsset, 'history', d.modal);

        if (!output) {
            return;
        }

        const assetSlug = Stellarify.assetToSlug(new StellarSdk.Asset(asset.code, asset.issuer));

        this.props.history.push(`transactions?asset=${assetSlug}&anchorDomain=${output.domain}`);
    }

    render() {
        const { onlyIcons, asset } = this.props;
        const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);

        const isXLMNative = asset.code === 'XLM' && asset.issuer === null;

        const {
            isDepositEnabled = false, isWithdrawEnabled = false, isHistoryEnabled = false,
        } = (directoryAsset && checkAssetSettings(directoryAsset)) || {};

        const containerClass = `ActionBtns_container ${onlyIcons ? 'hide_ActionText' : ''}`;

        return (
            <div className={containerClass}>
                {isHistoryEnabled ? (
                    <div onClick={() => this.onHistoryClick()}>
                        <div className="actionBtn">
                            <div className="btnHint btnHint_wide">Transfer history</div>
                            <img className="actionBtn_icon" src={images['icon-transactions']} alt="transfer-history" />
                        </div>
                    </div>
                ) : null}
                {isDepositEnabled ? (
                    <div className="actionBtn" onClick={() => this.onSepClick(true)}>
                        <div className="btnHint">Deposit</div>
                        <img className="actionBtn_icon" src={images['icon-deposit']} alt="deposit" />
                    </div>
                ) : null}

                {isWithdrawEnabled ? (
                    <div className="actionBtn" onClick={() => this.onSepClick(false)}>
                        <div className="btnHint">Withdraw</div>
                        <img className="actionBtn_icon" src={images['icon-withdraw']} alt="withdraw" />
                    </div>
                ) : null}

                {this.constructor.getBuyLumensLink(isXLMNative)}

                <Link
                    to={`/account/send?asset=${Stellarify.assetToSlug(new StellarSdk.Asset(asset.code, asset.issuer))}`}
                    onClick={() => this.props.d.send.resetSendForm()}
                >
                    <div className="actionBtn">
                        <div className="btnHint">Send</div>
                        <img className="actionBtn_icon" src={images['icon-send']} alt="send" />
                    </div>
                </Link>

                {asset.tradeLink ? (
                    <Link to={asset.tradeLink}>
                        <div className="actionBtn">
                            <div className="btnHint">Trade</div>
                            <img className="actionBtn_icon" src={images['icon-trade']} alt="trade" />
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
    history: PropTypes.objectOf(PropTypes.any),
};
