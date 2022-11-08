import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/driver/Driver';
import AssetCardSeparateLogo from '../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';

export default class AssetBalance extends React.Component {
    getAssetBalance() {
        const { d, asset } = this.props;

        return d.session.account
            .getSortedBalances()
            .find(balance => balance.code === asset.code && balance.issuer === asset.issuer).balance;
    }

    getUsdBalance(assetBalance) {
        const { d, asset } = this.props;

        const directoryAsset = _.find(d.ticker.data.assets, {
            code: asset.code,
            issuer: asset.issuer,
        });

        if (assetBalance && directoryAsset && directoryAsset.price_USD !== undefined) {
            return `$${(parseFloat(assetBalance) * directoryAsset.price_USD).toFixed(2)}`;
        }
        return '';
    }

    render() {
        const { d, asset, isDeposit, transaction } = this.props;

        const domainUrl = `https://${asset.domain}/`;
        const domainLink = (
            <a href={domainUrl} target="_blank" rel="nofollow noopener noreferrer">
                {asset.domain}
            </a>
        );

        const assetBalance = this.getAssetBalance();
        const usdBalance = this.getUsdBalance(assetBalance);

        const descriptionSpan = isDeposit ?
            (<span>
                Deposit native {asset.anchor_asset || asset.code} to get {asset.code} ({domainLink}) asset
                issued on Stellar
            </span>) :
            (<span>
                Withdraw {asset.code} ({domainLink}) Stellar asset to get native {asset.anchor_asset || asset.code}
            </span>);

        const descriptionConfirm = isDeposit
            ? <span>Please review the deposit details before sending funds.</span>
            : <span>Please review the details and click the Withdraw button to initiate the withdrawal process.</span>;

        return (
            <React.Fragment>
                <div className="userAsset_Block">
                    <AssetCardSeparateLogo code={asset.code} issuer={asset.issuer} d={d} />
                    <div className="BalanceBlock">
                        <span className="assetBalance">
                            {assetBalance} {asset.code}
                        </span>
                        <span className="usdBalance">{usdBalance}</span>
                    </div>
                </div>

                <div className="content_description">
                    {transaction && transaction.status === 'pending_user_transfer_start'
                        ? descriptionConfirm
                        : descriptionSpan}
                </div>
            </React.Fragment>
        );
    }
}

AssetBalance.propTypes = {
    isDeposit: PropTypes.bool.isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.objectOf(PropTypes.any).isRequired,
    transaction: PropTypes.objectOf(PropTypes.any),
};
