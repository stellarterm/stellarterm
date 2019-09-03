import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import AssetCardHelper from '../AssetCardHelper';
import images from '../../../../images';
import Ellipsis from '../../Ellipsis/Ellipsis';
import hexToRGBA from '../../../../lib/hexToRgba';
import Driver from '../../../../lib/Driver';

export default class AssetCardInRow extends AssetCardHelper {
    render() {
        const { asset, logo, domain, color } = this.getRenderedAssetData();
        const borderStyle = {};
        const backgroundStyle = {};

        if (color) {
            backgroundStyle.background = hexToRGBA(color, 0.08);
            borderStyle.borderColor = color;
        }

        const assetSymbol = asset.code[0];
        const unknownLogo = (
            <div className="AssetCard_unknown_logo unknown_small">
                <div className="Unknown_circle">
                    <span className="assetSymbol">{assetSymbol}</span>
                </div>
            </div>
        );

        const template = ReactDOMServer.renderToStaticMarkup(unknownLogo);
        const div = document.createElement('div');
        div.innerHTML = template;


        return (
            <span className="AssetCardInRow">
                {logo === 'unknown' && logo !== 'load' ? (
                    unknownLogo
                ) : (
                    <img
                        style={Object.assign({}, backgroundStyle, { border: '1px solid' }, borderStyle)}
                        className="Row_logo"
                        ref={(img) => {
                            this.img = img;
                        }}
                        onError={() => {
                            this.img.replaceWith(div);
                        }}
                        src={logo === 'load' ? images['icon-circle-preloader-gif'] : logo}
                        alt={asset.code} />)}
                {domain === 'load' ?
                    <span>{asset.code} - <Ellipsis /></span> :
                    <span>{`${asset.code}(${domain})`}</span>
                }
                </span>
        );
    }
}
AssetCardInRow.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    code: PropTypes.string.isRequired,
    issuer: PropTypes.string,
};
