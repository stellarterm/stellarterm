import React from 'react';
import PropTypes from 'prop-types';
import directory from '../directory';
import AssetCardMain from './AssetCardMain';
import hexToRGBA from '../lib/hexToRgba';

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
    let borderStyle = {};
    const backgroundStyle = {};

    if (anchor.color) {
        backgroundStyle.background = hexToRGBA(anchor.color, 0.08);
        borderStyle.borderColor = anchor.color;
    }

    const issuerAccountId =
        asset.issuer === null
            ? 'native lumens'
            : `${asset.issuer.substr(0, 12)}.........${asset.issuer.substr(-12, 12)}`;

    const assetCardClass = `AssetCard2 AssetCard2--container ${props.boxy ? 'AssetCard2--boxy' : ''}`;

    if (props.noborder) {
        borderStyle = { border: 'none' };
    }

    return (
        <div className={assetCardClass} style={borderStyle}>
            <AssetCardMain
                backgroundStyle={backgroundStyle}
                logo={anchor.logo}
                name={anchor.name}
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
};
