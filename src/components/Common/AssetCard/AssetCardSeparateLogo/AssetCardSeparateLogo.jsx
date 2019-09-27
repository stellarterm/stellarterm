import React from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import Driver from '../../../../lib/Driver';
import AssetCardHelper from '../AssetCardHelper';
import images from '../../../../images';
import Ellipsis from '../../Ellipsis/Ellipsis';


export default class AssetCardSeparateLogo extends AssetCardHelper {
    getLogoBlock(logo, color, asset, directoryLogo) {
        const style = {
            border: `1px solid ${color}`,
            background: `${color}0D`,
        };

        const unknownLogo = (
            <div className="AssetCard_unknown_logo" style={style}>
                <div className="Unknown_circle">
                    <span className="assetSymbol">{asset.code[0]}</span>
                </div>
            </div>
        );

        if (logo === 'unknown') {
            return <div className="AssetCardMain_logo_load">{unknownLogo}</div>;
        }

        if (logo === 'load') {
            return (
                <div className="AssetCardMain_logo_load">
                    <img src={images['icon-circle-preloader-gif']} alt={asset.code} />
                </div>
            );
        }

        const template = ReactDOMServer.renderToStaticMarkup(unknownLogo);
        const div = document.createElement('div');
        div.innerHTML = template;

        return (
            <div className="AssetCardSeparateLogo_logo" style={style}>
                <img
                    onError={e => this.constructor.onImageLoadError(e, directoryLogo, div)}
                    src={logo}
                    alt="logo" />
            </div>
        );
    }

    render() {
        const { asset, logo, domain, color, directoryLogo } = this.getRenderedAssetData();
        const { code, issuer } = asset;
        const logoBlock = this.getLogoBlock(logo, color, asset, directoryLogo);

        const viewIssuer = this.props.longIssuer ?
            issuer :
            `${issuer.substr(0, 6)}...${issuer.substr(-6, 6)}`;

        return (
            <div className="AssetCardSeparateLogo">
                {logoBlock}
                <div className="AssetCardSeparateLogo_details">
                    <div className="AssetCardSeparateLogo_details-row">
                        <span>{code}</span>
                        <span>
                            {domain !== 'load' ? domain : <Ellipsis />}
                        </span>
                    </div>
                    <span>{viewIssuer}</span>
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
};

