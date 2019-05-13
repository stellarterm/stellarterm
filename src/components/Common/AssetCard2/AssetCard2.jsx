import React from 'react';
import PropTypes from 'prop-types';
import directory from '../../../directory';
import hexToRGBA from '../../../lib/hexToRgba';
import AssetCardMain from './AssetCardMain/AssetCardMain';

// This is AssetCard2, the preferred way of displaying an asset in stellarterm.
// The parent container should be 340px or wider

// Options
//  - boxy: removes the rounded borders

// You may also pass in children elements to sit nicely with the AssetCard2.
// The children elements are responsible for padding within the AssetCard

export default function AssetCard2(props) {
    if (!props.code) {
        throw new Error(`AssetCard2 expects to get a code in the props. Instead, got: ${props.code}`);
    }

    const isXLMNative = props.code === 'XLM' && props.domain === undefined && props.issuer === undefined;
    const haveDomain = props.domain !== undefined;
    const haveIssuer = props.issuer !== undefined;

    let asset = {};
    if (isXLMNative) {
        asset = directory.nativeAsset;
    } else if (haveDomain) {
        asset = directory.getAssetByDomain(props.code, props.domain);
    } else if (haveIssuer) {
        asset = directory.resolveAssetByAccountId(props.code, props.issuer);
    } else {
        throw new Error(
            `AssetCard2 expects to get either domain or issuer. Input code: ${props.code} Domain: ${
                props.domain
            } Issuer: ${props.issuer}`,
        );
    }
    if (asset === null) {
        throw new Error(
            'AssetCard2 expects domains or issuer to point to a valid asset/anchor. Please do validation before calling AssetCard2',
        );
    }

    const anchor = directory.getAnchor(asset.domain);

    const issuerAccountId =
        asset.issuer === null
            ? 'native lumens'
            : `${asset.issuer.substr(0, 12)}.........${asset.issuer.substr(-12, 12)}`;

    const assetCardClass = `AssetCard2 AssetCard2--container ${props.boxy ? 'AssetCard2--boxy' : ''}`;

    let currency;
    let hostName;
    let { color } = anchor;
    let { logo, name } = anchor;
    let logoPadding = false;
    const isUnknown = name === 'unknown';

    if (isUnknown) {
        const unknownAssetsData = JSON.parse(localStorage.getItem('unknownAssetsData')) || [];
        const assetData = unknownAssetsData.find(assetLocalItem => (
            assetLocalItem.code === props.code && assetLocalItem.issuer === props.issuer
        )) || {};

        currency = props.currency || assetData.currency;
        hostName = props.host || assetData.host;
        color = props.color || assetData.color || anchor.color;
    }

    name = hostName || name;

    if (currency) {
        const { image, host } = currency;
        const domain = host && host.split('//')[1];
        name = domain || name;
        logo = image || logo;
        logoPadding = !!image;
    }

    let borderStyle = {};
    const backgroundStyle = {};

    if (color) {
        backgroundStyle.background = hexToRGBA(color, 0.08);
        borderStyle.borderColor = color;
    }

    if (props.noborder) {
        borderStyle = { border: 'none' };
    }

    return (
        <div className={assetCardClass} style={borderStyle}>
            <AssetCardMain
                backgroundStyle={backgroundStyle}
                logo={logo}
                logoWithPadding={logoPadding}
                name={name}
                assetCode={asset.code}
                issuerAccountId={issuerAccountId} />

            {props.children ? (
                <div className="AssetCard2__addon" style={Object.assign({}, borderStyle, backgroundStyle)}>
                    {props.children}
                </div>
            ) : null}
        </div>
    );
}

AssetCard2.propTypes = {
    code: PropTypes.string.isRequired,
    boxy: PropTypes.bool,
    issuer: PropTypes.string,
    domain: PropTypes.string,
    children: PropTypes.element,
    noborder: PropTypes.bool,
    host: PropTypes.string,
    color: PropTypes.string,
    currency: PropTypes.shape({
        image: PropTypes.string,
        host: PropTypes.string,
    }),
};
