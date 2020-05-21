import React from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import Driver from '../../../../lib/Driver';
import AssetCardHelper from '../AssetCardHelper';
import Ellipsis from '../../Ellipsis/Ellipsis';

const DEFAULT_LOGO_SIZE = 50;

export default class AssetCardSeparateLogo extends AssetCardHelper {
    getLogoBlock(logo, color, asset, directoryLogo) {
        const { logoSize, boxy } = this.props;
        const style = {
            border: `1px solid ${color}`,
            borderRadius: boxy ? 0 : 4,
            background: `${color}0D`,
        };

        const sizeStyles = {
            height: logoSize || DEFAULT_LOGO_SIZE,
            width: logoSize || DEFAULT_LOGO_SIZE,
            minWidth: logoSize || DEFAULT_LOGO_SIZE,
            minHeight: logoSize || DEFAULT_LOGO_SIZE,
            marginRight: (logoSize || DEFAULT_LOGO_SIZE) * 0.2,
        };

        const innerSizeStyles = {
            height: (logoSize || DEFAULT_LOGO_SIZE) * 0.8,
            width: (logoSize || DEFAULT_LOGO_SIZE) * 0.8,
        };

        const loaderSize = {
            height: (logoSize || DEFAULT_LOGO_SIZE) * 0.4,
            width: (logoSize || DEFAULT_LOGO_SIZE) * 0.4,
        };

        const unknownLogo = (
            <div className="AssetCard_unknown_logo">
                <div className="Unknown_circle" style={innerSizeStyles}>
                    <span className="assetSymbol">{asset.code[0]}</span>
                </div>
            </div>
        );

        if (logo === 'unknown') {
            return (
                <div className="AssetCardMain_logo_load" style={Object.assign({}, sizeStyles, style)}>
                    {unknownLogo}
                </div>
            );
        }

        if (logo === 'load') {
            return (
                <div className="AssetCardMain_logo_load" style={Object.assign({}, style, sizeStyles)}>
                    <div className="nk-spinner" style={loaderSize} />
                </div>
            );
        }

        const template = ReactDOMServer.renderToStaticMarkup(unknownLogo);
        const div = document.createElement('div');
        div.innerHTML = template;

        return (
            <div className="AssetCardSeparateLogo_logo" style={Object.assign({}, style, sizeStyles)}>
                <img
                    onError={e => this.constructor.onImageLoadError(e, directoryLogo, div)}
                    style={innerSizeStyles}
                    src={logo}
                    alt="logo" />
            </div>
        );
    }

    render() {
        const { noIssuer, longIssuer } = this.props;
        const { asset, logo, domain, color, directoryLogo } = this.getRenderedAssetData();
        const { code, issuer } = asset;
        const logoBlock = this.getLogoBlock(logo, color, asset, directoryLogo);

        let viewIssuer = '';
        const isNative = code === 'XLM' && !issuer;

        if (isNative) {
            viewIssuer = 'Native lumens';
        } else {
            viewIssuer = longIssuer ?
                issuer :
                `${issuer.substr(0, 6)}...${issuer.substr(-6, 6)}`;
        }

        return (
            <div className="AssetCardSeparateLogo">
                {logoBlock}
                <div className="AssetCardSeparateLogo_details">
                    <div className={`AssetCardSeparateLogo_details-row ${noIssuer ? 'inColumn' : ''}`}>
                        <span className="AssetCardSeparateLogo_code">{code}</span>
                        <span className="AssetCardSeparateLogo_domain">
                            {domain !== 'load' ? domain : <Ellipsis />}
                        </span>
                    </div>
                    {noIssuer ? null : <span className="AssetCardSeparateLogo_issuer">{viewIssuer}</span>}
                </div>
            </div>
        );
    }
}
AssetCardSeparateLogo.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    code: PropTypes.string,
    issuer: PropTypes.string,
    longIssuer: PropTypes.bool,
    noIssuer: PropTypes.bool,
    logoSize: PropTypes.number,
    boxy: PropTypes.bool,
};

