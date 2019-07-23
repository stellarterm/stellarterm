import React from 'react';
import PropTypes from 'prop-types';
import directory from 'stellarterm-directory';

// New code should use AssetCard2 instead of this AssetCard
export default function AssetCard(props) {
    const asset = props.asset;
    let containerClassName = 'AssetCard';
    if (props.fixed) {
        containerClassName += ' AssetCard--fixed';
    }
    if (props.button) {
        containerClassName += ' AssetCard--button';
    }
    if (props.lit) {
        containerClassName += ' AssetCard--lit';
    }


    if (!asset) {
        // Blank card
        return (<div className="AssetCard__main" />);
    }

    let anchor;
    const issuerId = props.asset.getIssuer();
    const directoryAsset = directory.getAssetBySdkAsset(asset);
    if (directoryAsset === null) {
        anchor = directory.unknownAnchor;
    } else {
        anchor = directory.getAnchor(directoryAsset.domain);
    }

    let domainLink;
    if (!anchor.website || props.noLink) {
        domainLink = (
            <span className="AssetCard__federation">
                {(props.currency && props.currency.host) || props.host || anchor.name}
            </span>
        );
    } else {
        domainLink = <a className="AssetCard__federation" href={anchor.website} target="_blank">{anchor.name}</a>;
    }

    let issuerAccountId;
    if (asset.isNative()) {
        issuerAccountId = <p className="AssetCard__issuerAccountId">native lumens</p>;
    } else {
        issuerAccountId = <p className="AssetCard__issuerAccountId">{issuerId}</p>;
    }
    const assetCardMain = (
        <div className="AssetCard__main">
            <div className="AssetCard__logo">
                <img
                    className="AssetCard__logo__image"
                    src={(props.currency && props.currency.image) || anchor.logo}
                    alt={anchor.logo} />
            </div>
            <div className="AssetCard__content">
                <div className="AssetCard__header">
                    <span className="AssetCard__code">{props.asset.getCode()}</span>
                    {domainLink}
                </div>
                {issuerAccountId}
            </div>
        </div>
    );

    if (props.children) {
        containerClassName += ' AssetCard--container';
        return (
            <div className={containerClassName}>
                {assetCardMain}
                <div className="AssetCard__addon">
                    {props.children}
                </div>
            </div>
        );
    }

    return (
        <div className={containerClassName}>
            {assetCardMain}
        </div>
    );
}
AssetCard.propTypes = {
    asset: PropTypes.objectOf(PropTypes.string),
    children: PropTypes.bool,
    noLink: PropTypes.bool,
    fixed: PropTypes.bool,
    button: PropTypes.bool,
    lit: PropTypes.bool,
    host: PropTypes.string,
    currency: PropTypes.shape({
        image: PropTypes.string,
        host: PropTypes.string,
    }),
};
