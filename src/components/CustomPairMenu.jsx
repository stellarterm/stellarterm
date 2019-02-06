import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../lib/Driver';
import Stellarify from '../lib/Stellarify';
import AssetDropDown from './AssetDropDown';


export default class CustomPairMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            baseBuying: null,
            counterSelling: null,
        };
    }

    baseBuyingUpdate(asset) {
        this.setState({
            baseBuying: asset,
        });
    }

    counterSellingUpdate(asset) {
        this.setState({
            counterSelling: asset,
        });
    }

    goToTrade() {
        window.location = `#${Stellarify.pairToExchangeUrl(this.state.baseBuying, this.state.counterSelling)}`;
    }

    render() {
        const { baseBuying, counterSelling } = this.state;
        return (
            <div className="island">
                <div className="island__header">
                  Exchange pair
                </div>
                <div className="island__sub CustomPairMenu__title">
                    <div className="island__sub__division">
                        <h3 className="island__sub__division__title">Base asset</h3>
                    </div>
                    <div className="island__sub__division">
                        <h3 className="island__sub__division__title">Counter asset</h3>
                    </div>
                </div>

                <div className="island__sub CustomPairMenu__container">
                    <AssetDropDown
                        onUpdate={(asset) => { this.baseBuyingUpdate(asset); }}
                        asset={baseBuying}
                        d={this.props.d}
                        exception={counterSelling}
                        isBase />
                    <div className="CustomPairMenu__separator" />
                    <AssetDropDown
                        d={this.props.d}
                        onUpdate={(asset) => { this.counterSellingUpdate(asset); }}
                        asset={counterSelling}
                        exception={baseBuying}
                        isBase={false} />
                </div>

                {(counterSelling && baseBuying) ?
                    <button
                        onClick={() => this.goToTrade()}
                        className="CustomPairMenu__button">
                        {`Go to ${baseBuying.code}/${counterSelling.code} trade page`}
                    </button> :
                    null
                }
            </div>
        );
    }
}
CustomPairMenu.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
