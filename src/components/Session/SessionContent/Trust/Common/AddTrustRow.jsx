import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';
import AssetCard2 from '../../../../AssetCard2';
import TrustButton from '../../../TrustButton';

export default class AddTrustRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: undefined,
        };
    }

    componentDidMount() {
        const { currency } = this.props;
        if (currency && currency.image) {
            this.getColor(currency);
        }
    }

    async getColor({ image }) {
        const result = await this.props.d.session.account.getAverageColor(image);
        if (result.error === null) {
            this.setState({ color: result.hex });
        }
    }

    render() {
        return (
            <div className="AddTrustRow row">
                <div className="row__assetCard2">
                    <AssetCard2
                        code={this.props.asset.getCode()}
                        issuer={this.props.asset.getIssuer()}
                        color={this.state.color}
                        currency={this.props.currency}
                        host={this.props.host} />
                </div>
                <TrustButton
                    d={this.props.d}
                    asset={this.props.asset}
                    message={`${this.props.asset.getCode()} accepted`}
                    trustMessage={`Accept ${this.props.asset.getCode()}`}
                    currency={this.props.currency}
                    color={this.state.color}
                    host={this.props.host} />
            </div>
        );
    }
}

AddTrustRow.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.instanceOf(StellarSdk.Asset).isRequired,
    host: PropTypes.string,
    currency: PropTypes.shape({
        image: PropTypes.string,
        host: PropTypes.string,
    }),
};
