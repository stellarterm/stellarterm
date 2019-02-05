import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../lib/Driver';
import Stellarify from '../lib/Stellarify';
import AssetDropDown from './AssetDropDown';


export default class CustomMarketDropDown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            baseBuying: null,
            counterSelling: null,
        };

        this.baseBuyingUpdate = (asset) => {
            this.setState({
                baseBuying: asset,
            });
        };
        this.counterSellingUpdate = (asset) => {
            this.setState({
                counterSelling: asset,
            });
        };
        this.goToTrade = () => {
            window.location = `#${Stellarify.pairToExchangeUrl(this.state.baseBuying, this.state.counterSelling)}`;
        };
    }

    render() {
        return (
            <div className="island">
                <div className="island__header">
                  Custom exchange pair
                </div>
                <div className="island__sub CustomMarketDropDown__title">
                    <div className="island__sub__division">
                        <h3 className="island__sub__division__title">Base asset</h3>
                    </div>
                    <div className="island__sub__division">
                        <h3 className="island__sub__division__title">Counter asset</h3>
                    </div>
                </div>
                <div className="island__sub CustomMarketDropDown__container">
                    <AssetDropDown
                        onUpdate={this.baseBuyingUpdate}
                        asset={this.state.baseBuying}
                        d={this.props.d}
                        exception={this.state.counterSelling}
                        isBase />
                    <div className="CustomMarketDropDown__separator" />
                    <AssetDropDown
                        d={this.props.d}
                        onUpdate={this.counterSellingUpdate}
                        asset={this.state.counterSelling}
                        exception={this.state.baseBuying}
                        isBase={false} />
                </div>
                {(this.state.counterSelling && this.state.baseBuying) ?
                    <button
                        onClick={this.goToTrade}
                        className="CustomMarketDropDown__button">
                        {`Go to ${this.state.baseBuying.code}/${this.state.counterSelling.code} trade page`}
                    </button> :
                    null
                }
            </div>
        );
    }
}
CustomMarketDropDown.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
