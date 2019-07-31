import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import images from '../../../images';
import Driver from '../../../lib/Driver';
import Stellarify from '../../../lib/Stellarify';
import AssetDropDown from '../../Common/AssetPair/AssetDropDown/AssetDropDown';

export default class CustomPairMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            baseBuying: null,
            counterSelling: StellarSdk.Asset.native(),
        };
    }

    getAssetDropDown(d, assetType) {
        const isBase = assetType === 'baseBuying';
        const exception = isBase ? this.state.counterSelling : this.state.baseBuying;
        return (
            <AssetDropDown
                d={d}
                onUpdate={(asset) => {
                    this.stateUpdate(assetType, asset);
                }}
                clear={() => this.stateUpdate(assetType, null)}
                asset={this.state[assetType]}
                exception={exception} />
        );
    }

    getSeparator() {
        if (!this.state.baseBuying || !this.state.counterSelling) {
            return <div className="CustomPairMenu__separator" />;
        }
        return (
            <div className="CustomPairMenu__swap" onClick={() => this.swap()}>
                <img src={images.switch} alt="swap" width="20" height="24" />
            </div>
        );
    }

    stateUpdate(assetType, asset) {
        this.setState({ [assetType]: asset });
    }

    // goToTrade() {
    //     window.location = `${Stellarify.pairToExchangeUrl(this.state.baseBuying, this.state.counterSelling)}`;
    // }

    swap() {
        const { baseBuying, counterSelling } = this.state;
        this.setState({
            baseBuying: counterSelling,
            counterSelling: baseBuying,
        });
    }

    render() {
        const { baseBuying, counterSelling } = this.state;
        const link = (baseBuying && counterSelling)
            && Stellarify.pairToExchangeUrl(this.state.baseBuying, this.state.counterSelling);

        return (
            <div className="island">
                <div className="island__header CustomPairMenu__header">Exchange pair</div>
                <div className="island__sub CustomPairMenu__title_container">
                    <div className="island__sub__division">
                        <h3 className="CustomPairMenu__title">Base asset</h3>
                    </div>
                    <div className="island__sub__division">
                        <h3 className="CustomPairMenu__title">Counter asset</h3>
                    </div>
                    <div className="island__sub__division" />
                </div>

                <div className="island__sub CustomPairMenu__container">
                    {this.getAssetDropDown(this.props.d, 'baseBuying')}

                    {this.getSeparator()}

                    {this.getAssetDropDown(this.props.d, 'counterSelling')}

                    <Link to={`/${link}`}>
                        <button
                            disabled={!counterSelling || !baseBuying}
                            className="CustomPairMenu__button">
                            Start trading
                    </button>
                    </Link>
                </div>
            </div>
        );
    }
}
CustomPairMenu.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
