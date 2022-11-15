import React from 'react';
import PropTypes from 'prop-types';
import AssetPair from '../../Common/AssetPair/AssetPair';
import AssetPickerNarrow from './AssetPickerNarrow/AssetPickerNarrow';
import Driver from '../../../lib/driver/Driver';


export default class CustomMarketPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            baseBuying: null,
            counterSelling: null,
        };
    }

    assetUpdate(asset, assetType) {
        this.setState({
            [assetType]: asset,
        });
    }

    render() {
        const { baseBuying, counterSelling } = this.state;
        const classDivision = 'island__sub__division';

        const pickedAsset =
            baseBuying || counterSelling ? (
                <AssetPair row baseBuying={baseBuying} counterSelling={counterSelling} d={this.props.d} />
            ) : null;

        return (
            <div className="island">
                <div className="island__header">Custom exchange pair</div>

                <div className="island__sub CustomMarketPicker_title">
                    <div className={classDivision}>
                        <h3 className={`${classDivision}__title`}>Base asset</h3>
                    </div>
                    <div className={classDivision}>
                        <h3 className={`${classDivision}__title`}>Counter asset</h3>
                    </div>
                </div>

                <div className="island__sub CustomMarketPicker_picker">
                    <div className={classDivision}>
                        <AssetPickerNarrow onUpdate={asset => this.assetUpdate(asset, 'baseBuying')} />
                    </div>
                    <div className={classDivision}>
                        <AssetPickerNarrow onUpdate={asset => this.assetUpdate(asset, 'counterSelling')} />
                    </div>
                </div>
                {pickedAsset}
            </div>
        );
    }
}
CustomMarketPicker.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
