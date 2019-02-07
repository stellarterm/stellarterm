import React from 'react';
import PropTypes from 'prop-types';
import directory from '../directory';

// This is AssetCard2, the preferred way of displaying an asset in stellarterm.
// The parent container should be 340px or wider

// Options
//  - boxy: removes the rounded borders

// You may also pass in children elements to sit nicely with the AssetCard2.
// The children elements are responsible for padding within the AssetCard

const BACKGROUND_OPACITY = 0.08;
const decAtIndex = (input, index) => parseInt(input.substr(index, 2), 16);
const hexToRgba = input =>
    `rgba(${decAtIndex(input, 1)},${decAtIndex(input, 3)},${decAtIndex(input, 5)},${BACKGROUND_OPACITY})`;

export default function AssetCard2(props) {
    if (!props.code) {
        throw new Error(`AssetCard2 expects to get a code in the props. Instead, got: ${props.code}`);
    }

    let asset = {};
    if (props.code === 'XLM' && props.domain === undefined && props.issuer === undefined) {
        asset = directory.nativeAsset;
    } else if (props.domain !== undefined) {
        asset = directory.getAssetByDomain(props.code, props.domain);
        if (asset === null) {
            throw new Error(
                'AssetCard2 expects domains to point to a valid asset/anchor. Please do validation before calling AssetCard2',
            );
        }
    } else if (props.issuer !== undefined) {
        asset = directory.resolveAssetByAccountId(props.code, props.issuer);
    } else {
        throw new Error(
            `AssetCard2 expects to get either domain or issuer. Input code: ${props.code} Domain: ${
                props.domain
            } Issuer: ${props.issuer}`,
        );
    }

    const anchor = directory.getAnchor(asset.domain);
    const borderStyle = {};
    const backgroundStyle = {};
    if (anchor.color) {
        borderStyle.borderColor = anchor.color;
        const rgbaColor = hexToRgba(anchor.color, BACKGROUND_OPACITY);
        backgroundStyle.background = rgbaColor;
    }

    const issuerAccountId =
        asset.issuer === null
            ? 'native lumens'
            : `${asset.issuer.substr(0, 12)}.........${asset.issuer.substr(-12, 12)}`;
    // Unlike AssetCard (original), this one does not link to the domain. Users can simply type it in the address bar

    const assetCardMain = (
        <div className="AssetCard2__main" style={backgroundStyle}>
            <img className="AssetCard2__logo" src={anchor.logo} alt={props.code} />
            <div className="AssetCard2__content">
                <div className="AssetCard2__header">
                    <span className="AssetCard2__header__code">{asset.code}</span>
                    <span className="AssetCard2__header__domain">{anchor.name}</span>
                </div>
                <p className="AssetCard2__issuerAccountId">
                    Issuer (<strong>not you</strong>): {issuerAccountId}
                </p>
            </div>
        </div>
    );

    let containerClassName = 'AssetCard2';

    if (props.boxy) {
        containerClassName += ' AssetCard2--boxy';
    }

    if (props.children) {
        containerClassName += ' AssetCard2--container';
        return (
            <div className={containerClassName} style={borderStyle}>
                {assetCardMain}
                <div className="AssetCard2__addon" style={Object.assign({}, borderStyle, backgroundStyle)}>
                    {props.children}
                </div>
            </div>
        );
    }

    return (
        <div className={containerClassName} style={borderStyle}>
            {assetCardMain}
        </div>
    );
}

AssetCard2.propTypes = {
    code: PropTypes.string.isRequired,
    boxy: PropTypes.bool,
    issuer: PropTypes.string,
    domain: PropTypes.string,
    children: PropTypes.element,
};
