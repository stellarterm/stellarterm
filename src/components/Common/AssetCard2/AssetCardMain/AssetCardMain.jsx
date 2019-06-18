import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import Ellipsis from '../../Ellipsis/Ellipsis';
import images from '../../../../images';

export default class AssetCardMain extends React.Component {
    render() {
        const { backgroundStyle, logo, logoWithPadding, name, assetCode, issuerAccountId, assetSymbol } = this.props;
        const logoClassName = logoWithPadding ? 'AssetCard2_logo_with_padding' : '';
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
                ref={(img) => {
                    this.img = img;
                }}
                onError={() => {
                    this.img.replaceWith(div);
                }}
                className={`AssetCard2__logo ${logoClassName}`}
                src={logo}
                alt={assetCode} />
            );

        return (
            <div className="AssetCard2__main" style={backgroundStyle}>
                {logo === 'load' ? (
                    <div className="AssetCard2_logo_load">
                        <img src={images['icon-circle-preloader-gif']} alt={assetCode} />
                    </div>
                ) : (
                    logoSymbol
                )}
                <div className={`AssetCard2__content ${logoIsUnknown ? 'margin_AssetContent' : ''}`}>
                    <div className="AssetCard2__header">
                        <span className="AssetCard2__header__code">{assetCode}</span>
                        {name === 'load' ?
                            <span className="AssetCard2__header__domain"><Ellipsis /></span> :
                            <span className="AssetCard2__header__domain">{name !== 'unknown' ? name : 'Unknown'}</span>
                        }
                    </div>
                    <p className="AssetCard2__issuerAccountId">Issuer: {issuerAccountId}</p>
                </div>
            </div>
        );
    }
}

AssetCardMain.propTypes = {
    assetCode: PropTypes.string.isRequired,
    issuerAccountId: PropTypes.string,
    logo: PropTypes.string,
    logoWithPadding: PropTypes.bool,
    name: PropTypes.string,
    backgroundStyle: PropTypes.shape({
        background: PropTypes.string,
    }),
    assetSymbol: PropTypes.string,
};
