import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import Ellipsis from '../../Ellipsis/Ellipsis';
import images from '../../../../images';
import hexToRGBA from '../../../../lib/hexToRgba';
import Driver from '../../../../lib/Driver';
import AssetCardHelper from '../AssetCardHelper';

export default class AssetCardMain extends AssetCardHelper {
    render() {
        const { asset, logo, logoPadding, domain, color, directoryLogo } = this.getRenderedAssetData();
        const issuerAccountId =
            asset.issuer === null
                ? 'native lumens'
                : `${asset.issuer.substr(0, 12)}.........${asset.issuer.substr(-12, 12)}`;

        const assetCardClass = `AssetCardMain AssetCardMain--container ${this.props.boxy ? 'AssetCardHelper--boxy' : ''}`;

        let borderStyle = {};
        const backgroundStyle = {};

        if (color) {
            backgroundStyle.background = hexToRGBA(color, 0.08);
            borderStyle.borderColor = color;
        }

        if (this.props.noborder) {
            borderStyle = { border: 'none' };
        }
        const assetSymbol = asset.code[0]; // Takes first asset symbol, if no any image loaded
        const logoClassName = logoPadding ? 'AssetCardMain_logo_with_padding' : '';
        const logoIsUnknown = logo === 'unknown';
        const unknownLogo = (
            <div className="AssetCard_unknown_logo">
                <div className="Unknown_circle">
                    <span className="assetSymbol">{assetSymbol}</span>
                </div>
            </div>
        );

        const template = ReactDOMServer.renderToStaticMarkup(unknownLogo);
        const div = document.createElement('div');
        div.innerHTML = template;


        const logoSymbol = logoIsUnknown ?
            (unknownLogo) :
            (<img
                onError={e => this.constructor.onImageLoadError(e, directoryLogo, div)}
                className={`AssetCardMain__logo ${logoClassName}`}
                src={logo}
                alt={asset.code} />
            );

        return (
            <div className={assetCardClass} style={borderStyle}>
                <div className="AssetCardMain__main" style={backgroundStyle}>
                    {logo === 'load' ? (
                        <div className="AssetCardMain_logo_load">
                            <img src={images['icon-circle-preloader-gif']} alt={asset.code} />
                        </div>
                    ) : (
                        logoSymbol
                    )}
                    <div className={`AssetCardMain__content ${logoIsUnknown ? 'margin_AssetContent' : ''}`}>
                        <div className="AssetCardMain__header">
                            <span className="AssetCardMain__header__code">{asset.code}</span>
                            {domain === 'load' ?
                                <span className="AssetCardMain__header__domain"><Ellipsis /></span> :
                                <span className="AssetCardMain__header__domain">{domain}</span>
                            }
                        </div>
                        <p className="AssetCardMain__issuerAccountId">Issuer: {issuerAccountId}</p>
                    </div>
                </div>
                {this.props.children ? (
                    <div className="AssetCardMain__addon" style={Object.assign({}, borderStyle, backgroundStyle)}>
                        {this.props.children}
                    </div>
                ) : null}
            </div>
        );
    }
}

AssetCardMain.propTypes = {
    children: PropTypes.element,
    d: PropTypes.instanceOf(Driver).isRequired,
    code: PropTypes.string.isRequired,
    boxy: PropTypes.bool,
    issuer: PropTypes.string,
    domain: PropTypes.string,
    noborder: PropTypes.bool,
    host: PropTypes.string,
    color: PropTypes.string,
    currency: PropTypes.shape({
        image: PropTypes.string,
        host: PropTypes.string,
    }),
};
