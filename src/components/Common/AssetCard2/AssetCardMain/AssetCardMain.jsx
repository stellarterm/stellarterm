import React from 'react';
import PropTypes from 'prop-types';

export default function AssetCardMain(props) {
    const { backgroundStyle, logo, logoWithPadding, name, assetCode, issuerAccountId } = props;
    const logoClassName = logoWithPadding ? 'AssetCard2_logo_with_padding' : null;

    return (
        <div className="AssetCard2__main" style={backgroundStyle}>
            <img className={`AssetCard2__logo ${logoClassName}`} src={logo} alt={assetCode} />
            <div className="AssetCard2__content">
                <div className="AssetCard2__header">
                    <span className="AssetCard2__header__code">{assetCode}</span>
                    <span className="AssetCard2__header__domain">{name}</span>
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
