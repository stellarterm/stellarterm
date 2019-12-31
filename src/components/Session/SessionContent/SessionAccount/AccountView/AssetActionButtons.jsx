import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import directory from 'stellarterm-directory';
import Driver from '../../../../../lib/Driver';
import images from '../../../../../images';
import Stellarify from '../../../../../lib/Stellarify';

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

    onSendAssetClick(code, issuer) {
        const clickedSlug = Stellarify.assetToSlug(new StellarSdk.Asset(code, issuer));
        this.props.d.send.pickAssetToSend(clickedSlug);
    }

    getBuyCryptoLobsterLink(isXLMNative) {
        const { account, unfundedAccountId } = this.props.d.session;
        const accountID = account === null ? unfundedAccountId : account.accountId();
        const targetAddressParam = `?target_address=${accountID}`;

        if (!isXLMNative) { return null; }

        return (
            <a
                href={`https://lobstr.co/buy-crypto${targetAddressParam}`}
                target="_blank" rel="nofollow noopener noreferrer">
                <div className="actionBtn">
                    <div className="btnHint btnHint_buyLumens">Buy lumens</div>
                    <img className="actionBtn_icon" src={images['icon-deposit']} alt="withdraw" />
                </div>
            </a>
        );
    }

    render() {
        const { onlyIcons, asset } = this.props;
        const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);
        const isDepositEnabled = directoryAsset !== null && directoryAsset.deposit === true;
        const isWithdrawEnabled = directoryAsset !== null && directoryAsset.withdraw === true;
        const isXLMNative = asset.code === 'XLM' && asset.issuer === null;

        const containerClass = `ActionBtns_container ${onlyIcons ? 'hide_ActionText' : ''}`;

        return (
            <div className={containerClass}>
                {isDepositEnabled ? (
                    <div className="actionBtn" onClick={() => this.onSep6Click(true)}>
                        <div className="btnHint">Deposit</div>
                        <img className="actionBtn_icon" src={images['icon-deposit']} alt="deposit" />
                    </div>
                ) : null}

                {isWithdrawEnabled ? (
                    <div className="actionBtn" onClick={() => this.onSep6Click(false)}>
                        <div className="btnHint">Withdraw</div>
                        <img className="actionBtn_icon" src={images['icon-withdraw']} alt="withdraw" />
                    </div>
                ) : null}

                {this.getBuyCryptoLobsterLink(isXLMNative)}

                <Link to={'send/'} onClick={() => this.onSendAssetClick(asset.code, asset.issuer)}>
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
};
