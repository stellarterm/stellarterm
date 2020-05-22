import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import AssetCardSeparateLogo from '../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';

export default function AssetBalance(props) {
    const { d, asset, isDeposit, isConfirmModal } = props;

    const domainUrl = `https://${asset.domain}/`;

    const domainLink = (
        <a href={domainUrl} target="_blank" rel="nofollow noopener noreferrer">
            {asset.domain}
        </a>
    );

    const assetBalance = d.session.account
        .getSortedBalances()
        .find(balance => balance.code === asset.code && balance.issuer === asset.issuer).balance;

    const directoryAsset = _.find(d.ticker.data.assets, {
        code: asset.code,
        issuer: asset.issuer,
    });

    const usdBalance = directoryAsset ? `$${(parseFloat(assetBalance) * directoryAsset.price_USD).toFixed(2)}` : '';

    const descriptionSpan = isDeposit
        ? <span>Deposit native {asset.code} to get {asset.code} ({domainLink}) asset issued on Stellar</span>
        : <span>Withdraw {asset.code} ({domainLink}) Stellar asset to get native {asset.code}</span>;

    const descriptionConfirm = isDeposit
        ? <span>Please review the deposit details before sending funds</span>
        : <span>Please review the details and click the Withdraw button</span>;

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
                {isConfirmModal ? descriptionConfirm : descriptionSpan}
            </div>
        </React.Fragment>
    );
}

AssetBalance.propTypes = {
    isDeposit: PropTypes.bool.isRequired,
    isConfirmModal: PropTypes.bool,
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.objectOf(PropTypes.any).isRequired,
};
