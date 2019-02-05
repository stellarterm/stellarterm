import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Driver from '../lib/Driver';
import directory from '../directory';
import AssetCard2 from './AssetCard2';


export default class AssetListDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.dTicker = props.d.ticker;
        this.listenId = this.dTicker.event.listen(() => { this.forceUpdate(); });

        this.handleChoose = (asset) => {
            this.props.onUpdate(new StellarSdk.Asset(asset.code, asset.issuer));
        };
    }
    componentWillUnmount() {
        this.dTicker.event.unlisten(this.listenId);
    }
    render() {
        const rows = [];
        _.each(this.dTicker.data.assets, (asset, index) => {
            const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);
            if (directoryAsset === null || directoryAsset.unlisted) {
                // Don't show unlisted assets
                return;
            }
            if ((this.props.exception) &&
                (this.props.exception.code === asset.code) && (this.props.exception.issuer === asset.issuer)) {
                // Don't show same assets on base and counter
                return;
            }
            rows.push(
                <div className="assetListDropDown_card" key={index} onClick={() => this.handleChoose(asset)}>
                    <AssetCard2 code={asset.code} issuer={asset.issuer} boxy={false} />
                </div>,
            );
        });
        return (
            <div className="assetListDropDown">
                {rows}
            </div>
        );
    }
}
AssetListDropDown.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    onUpdate: PropTypes.func,
    exception: PropTypes.objectOf(PropTypes.string),
};
