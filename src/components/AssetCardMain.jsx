import React from 'react';
import PropTypes from 'prop-types';

export default function AssetCardMain(props) {
    const { backgroundStyle, logo, name, assetCode, issuerAccountId } = props;

    return (
        <div className="AssetCard2__main" style={backgroundStyle}>
            <img className="AssetCard2__logo" src={logo} alt={assetCode} />
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
    name: PropTypes.string,
    backgroundStyle: PropTypes.shape({
        background: PropTypes.string,
    }),
};
