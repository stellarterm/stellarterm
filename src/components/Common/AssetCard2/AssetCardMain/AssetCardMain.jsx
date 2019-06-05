import React from 'react';
import PropTypes from 'prop-types';
import Ellipsis from '../../Ellipsis/Ellipsis';

const images = require('../../../../images');


export default function AssetCardMain(props) {
    const { backgroundStyle, logo, logoWithPadding, name, assetCode, issuerAccountId } = props;
    const logoClassName = logoWithPadding ? 'AssetCard2_logo_with_padding' : '';

    return (
        <div className="AssetCard2__main" style={backgroundStyle}>
            {logo === 'load' ?
                <div className="AssetCard2_logo_load">
                    <img
                        src={images['icon-circle-preloader-gif']}
                        alt={assetCode} />
                </div> :
                <img
                    className={`AssetCard2__logo ${logoClassName}`}
                    src={logo}
                    alt={assetCode} />}
            <div className="AssetCard2__content">
                <div className="AssetCard2__header">
                    <span className="AssetCard2__header__code">{assetCode}</span>
                    {name === 'load' ?
                        <span className="AssetCard2__header__domain"><Ellipsis /></span> :
                        <span className="AssetCard2__header__domain">{name}</span>
                    }
                </div>
                <p className="AssetCard2__issuerAccountId">
                    Issuer: {issuerAccountId}
                </p>
            </div>
        </div>
    );
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
};
