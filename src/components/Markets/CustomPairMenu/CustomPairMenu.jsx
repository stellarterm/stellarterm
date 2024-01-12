import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as StellarSdk from '@stellar/stellar-sdk';
import Driver from '../../../lib/driver/Driver';
import Stellarify from '../../../lib/helpers/Stellarify';
import AssetDropDown from '../../Common/AssetPair/AssetDropDown/AssetDropDown';
import SwitchBtn from '../../Basics/SwitchBtn/SwitchBtn';

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
                onUpdate={asset => {
                    this.stateUpdate(assetType, asset);
                }}
                asset={this.state[assetType]}
                exception={exception}
            />
        );
    }

    getSeparator() {
        if (!this.state.baseBuying || !this.state.counterSelling) {
            return <div className="CustomPairMenu__separator" />;
        }
        return <SwitchBtn onClickFunc={() => this.swap()} smallWidth />;
    }

    stateUpdate(assetType, asset) {
        this.setState({ [assetType]: asset });
    }

    swap() {
        const { baseBuying, counterSelling } = this.state;
        this.setState({
            baseBuying: counterSelling,
            counterSelling: baseBuying,
        });
    }

    render() {
        const { baseBuying, counterSelling } = this.state;
        const link =
            baseBuying &&
            counterSelling &&
            Stellarify.pairToExchangeUrl(this.state.baseBuying, this.state.counterSelling);

        return (
            <div className="island">
                <div className="island__header">Exchange pair</div>
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
                        <button disabled={!counterSelling || !baseBuying} className="CustomPairMenu__button">
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
