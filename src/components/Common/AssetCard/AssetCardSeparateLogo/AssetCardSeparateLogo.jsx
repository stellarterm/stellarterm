import React from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import Driver from '../../../../lib/driver/Driver';
import AssetCardHelper from '../AssetCardHelper';
import Ellipsis from '../../Ellipsis/Ellipsis';

const DEFAULT_LOGO_SIZE = 50;

export default class AssetCardSeparateLogo extends AssetCardHelper {
    constructor() {
        super();
        this.ref = React.createRef();
    }

    getLogoBlock(logo, color, asset, directoryLogo) {
        const { logoSize, boxy, circle } = this.props;
        const style = {
            border: circle ? 'none' : `1px solid ${color}`,
            // eslint-disable-next-line no-nested-ternary
            borderRadius: boxy ? 0 : (circle ? '50%' : 4),
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
            height: circle ? '100%' : (logoSize || DEFAULT_LOGO_SIZE) * 0.8,
            width: circle ? '100%' : (logoSize || DEFAULT_LOGO_SIZE) * 0.8,
            borderRadius: circle ? '50%' : 0,
        };

        const loaderSize = {
            height: (logoSize || DEFAULT_LOGO_SIZE) * 0.4,
            width: (logoSize || DEFAULT_LOGO_SIZE) * 0.4,
        };

        const unknownLogo = (
            <div
                className="AssetCard_unknown_logo" style={{
                    height: logoSize || DEFAULT_LOGO_SIZE,
                    width: logoSize || DEFAULT_LOGO_SIZE,
                }}
            >
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
                    alt="logo"
                />
            </div>
        );
    }

    render() {
        const { noIssuer, longIssuer, inRow, onlyLogo, logoSize } = this.props;
        const { asset, logo, domain, color, directoryLogo } = this.getRenderedAssetData();
        const { code, issuer } = asset;
        const logoBlock = this.getLogoBlock(logo, color, asset, directoryLogo);

        if (onlyLogo) {
            return logoBlock;
        }

        let viewIssuer = '';
        const isNative = code === 'XLM' && !issuer;

        if (isNative) {
            viewIssuer = 'Native lumens';
        } else {
            viewIssuer = longIssuer ?
                issuer :
                `${issuer.slice(0, 6)}...${issuer.slice(issuer.length - 6, issuer.length)}`;
        }

        return (
            <div className="AssetCardSeparateLogo" ref={this.ref}>
                {logoBlock}
                <div
                    className="AssetCardSeparateLogo_details" style={{
                        width: (this.ref.current && inRow) ? `${this.ref.current.clientWidth - (1.2 * (logoSize || DEFAULT_LOGO_SIZE))}px` : '80%',
                    }}
                >
                    <div className={`AssetCardSeparateLogo_details-row ${noIssuer ? 'inColumn' : ''} ${inRow ? 'inRow' : ''}`}>
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
    circle: PropTypes.bool,
    inRow: PropTypes.bool,
    onlyLogo: PropTypes.bool,
};

