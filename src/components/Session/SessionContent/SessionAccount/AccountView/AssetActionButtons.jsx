import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as StellarSdk from '@stellar/stellar-sdk';
import directory from 'stellarterm-directory';
import Driver from '../../../../../lib/driver/Driver';
import images from '../../../../../images';
import Stellarify from '../../../../../lib/helpers/Stellarify';
import { getTransferDomain, checkAssetSettings, getTransferServer } from '../../../../../lib/helpers/SepUtils';
import { UNSUPPORTED_JWT_AUTH_TYPES } from '../../../../../lib/constants/sessionConstants';

export default class AssetActionButtons extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false,
        };
    }

    async onSepClick(isDeposit) {
        const { d, asset } = this.props;
        const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);

        if (directoryAsset.sep24 && !this.checkIsJWTSupported(isDeposit ? 'Deposits' : 'Withdrawals')) {
            return;
        }

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
        if (!this.checkIsJWTSupported('History')) {
            return;
        }
        const { d, asset } = this.props;
        const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);

        const { output } = await getTransferDomain(directoryAsset, 'history', d.modal);

        if (!output) {
            return;
        }

        const assetSlug = Stellarify.assetToSlug(new StellarSdk.Asset(asset.code, asset.issuer));

        this.props.history.push(`transactions?asset=${assetSlug}&anchorDomain=${output.domain}`);
    }

    getBuyLumensLinks(isXLMNative) {
        if (!isXLMNative) {
            return null;
        }

        return (
            <div className="ActionBtns_container hide_ActionText">
                <Link
                    to="/account/send?asset=XLM-native"
                    onClick={() => this.props.d.send.resetSendForm()}
                >
                    <div className="actionBtn">
                        <div className="btnHint">Send</div>
                        <img className="actionBtn_icon" src={images['icon-send']} alt="send" />
                    </div>
                </Link>


                <Link to="/swap/XLM-native/USDC-www.centre.io">
                    <div className="actionBtn">
                        <div className="btnHint">Swap</div>
                        <img className="actionBtn_icon" src={images['icon-swap']} alt="swap" />
                    </div>
                </Link>

                <Link to="/exchange/XLM-native/USDC-www.centre.io">
                    <div className="actionBtn">
                        <div className="btnHint">Trade</div>
                        <img className="actionBtn_icon" src={images['icon-trade']} alt="trade" />
                    </div>
                </Link>

                <Link to="/buy-crypto?crypto=xlm_stellar">
                    <div className="actionBtn">
                        <div className="btnHint btnHint_wide">Buy lumens</div>
                        <img className="actionBtn_icon" src={images['icon-buy']} alt="withdraw" />
                    </div>
                </Link>
            </div>

        );
    }

    checkIsJWTSupported(type) {
        const { authType } = this.props.d.session;
        const isJWTUnsupported = UNSUPPORTED_JWT_AUTH_TYPES.has(authType);

        if (isJWTUnsupported) {
            this.props.d.toastService.error(
                `${type} not available`,
                `Deposits and withdrawals are not available with ${UNSUPPORTED_JWT_AUTH_TYPES.get(authType)} at the moment`,
            );
        }

        return !isJWTUnsupported;
    }

    render() {
        const { onlyIcons, asset } = this.props;
        const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);

        const isXLMNative = asset.code === 'XLM' && asset.issuer === null;

        const {
            isDepositEnabled = false, isWithdrawEnabled = false, isHistoryEnabled = false,
        } = (directoryAsset && checkAssetSettings(directoryAsset)) || {};

        const containerClass = `ActionBtns_container ${onlyIcons ? 'hide_ActionText' : ''}`;

        if (isXLMNative) {
            return this.getBuyLumensLinks(isXLMNative);
        }

        return (
            <div className={containerClass}>
                <Link
                    to={`/account/send?asset=${Stellarify.assetToSlug(new StellarSdk.Asset(asset.code, asset.issuer))}`}
                    onClick={() => this.props.d.send.resetSendForm()}
                >
                    <div className="actionBtn">
                        <div className="btnHint">Send</div>
                        <img className="actionBtn_icon" src={images['icon-send']} alt="send" />
                    </div>
                </Link>

                {asset.swapLink ? (
                    <Link to={asset.swapLink}>
                        <div className="actionBtn">
                            <div className="btnHint">Swap</div>
                            <img className="actionBtn_icon" src={images['icon-swap']} alt="swap" />
                        </div>
                    </Link>
                ) : null}

                {asset.tradeLink ? (
                    <Link to={asset.tradeLink}>
                        <div className="actionBtn">
                            <div className="btnHint">Trade</div>
                            <img className="actionBtn_icon" src={images['icon-trade']} alt="trade" />
                        </div>
                    </Link>
                ) : null}

                {(isHistoryEnabled || isDepositEnabled || isDepositEnabled) ?
                    <div className="actionBtn">
                        <div className="btnHint btnMenu">
                            {isHistoryEnabled ? (
                                <div onClick={() => this.onHistoryClick()}>
                                    <div className="actionBtn">
                                        <img className="actionBtn_icon" src={images['icon-transactions']} alt="transfer-history" />
                                        Transfer history
                                    </div>
                                </div>
                            ) : null}
                            {isDepositEnabled ? (
                                <div className="actionBtn" onClick={() => this.onSepClick(true)}>
                                    <img className="actionBtn_icon" src={images['icon-deposit']} alt="deposit" />
                                    Deposit
                                </div>
                            ) : null}

                            {isWithdrawEnabled ? (
                                <div className="actionBtn" onClick={() => this.onSepClick(false)}>
                                    <img className="actionBtn_icon" src={images['icon-withdraw']} alt="withdraw" />
                                    Withdraw
                                </div>
                            ) : null}
                        </div>
                        <img className="actionBtn_icon" src={images['icon-three-dots']} alt="dots" />
                    </div>
                    : <div className="emptyIcon" />}
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
