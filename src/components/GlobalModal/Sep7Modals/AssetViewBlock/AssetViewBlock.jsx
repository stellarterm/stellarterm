import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';


export default class AssetViewBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: '#A5A0A7',
            updated: false,
        };
    }

    getLogoBlock(image, code, domain) {
        const { color, updated } = this.state;
        const style = {
            border: `1px solid ${color}`,
            background: `${color}0D`,
        };

        if (!image) {
            return (
                <div className="AssetCard_unknown_logo AssetViewBlock_logo" style={style}>
                    <div className="Unknown_circle">
                        <span className="assetSymbol">{code[0]}</span>
                    </div>
                </div>
            );
        }
        if (!updated) {
            this.getColor(image, code, domain);
        }
        return (
            <div className="AssetViewBlock_logo" style={style}>
                <img src={image} alt="logo" />
            </div>
        );
    }

    async getColor(image, code, domain) {
        const color = await this.props.d.session.handlers.getAverageColor(image, code, domain);
        this.setState({
            color,
            updated: true,
        });
    }

    render() {
        const { currency, domain, asset } = this.props;
        const { code, issuer } = asset;
        const { image } = currency || '';
        const logo = this.getLogoBlock(image, code, domain);
        const viewIssuer = `${issuer.substr(0, 6)}...${issuer.substr(-6, 6)}`;

        return (
            <div className="AssetViewBlock">
                {logo}
                <div className="AssetViewBlock_details">
                    <div className="AssetViewBlock_details-row">
                        <span>{code}</span>
                        <span>{domain || 'unknown'}</span>
                    </div>
                    <span>{viewIssuer}</span>
                </div>
            </div>
        );
    }
}
AssetViewBlock.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.objectOf(PropTypes.string),
    domain: PropTypes.string,
    currency: PropTypes.objectOf(PropTypes.any),
};

