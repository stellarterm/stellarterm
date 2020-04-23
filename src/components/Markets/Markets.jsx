import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../lib/Driver';
import AssetList from '../Common/AssetList/AssetList';
import CustomPairMenu from './CustomPairMenu/CustomPairMenu';
import CustomMarketPicker from './CustomMarketPicker/CustomMarketPicker';
import SearchByAnchor from '../Common/SearchByAnchor/SearchByAnchor';

import images from '../../images';
import AssetDropDown from '../Common/AssetPair/AssetDropDown/AssetDropDown';

export default class Markets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            zeroAssetsVisible: false,
            fromStellarTicker: false,
            baseAsset: StellarSdk.Asset.native(),
        };
    }

    render() {
        const { d } = this.props;
        const { zeroAssetsVisible, fromStellarTicker, baseAsset } = this.state;

        return (
            <div>
                <div className="so-back islandBack islandBack--t">
                    <SearchByAnchor d={d} tradeLink />
                </div>
                <div className="so-back islandBack">
                    <div className="island">
                        <div className="AssetList_Header">
                            <div className="AssetList_Tabs">
                                <div
                                    onClick={() => this.setState({ fromStellarTicker: false })}
                                    className={`ListHeader_Title ${!fromStellarTicker ? 'active' : ''}`}>
                                    Known assets
                                </div>
                                <div
                                    onClick={() => this.setState({ fromStellarTicker: true })}
                                    className={`ListHeader_Title ${fromStellarTicker ? 'active' : ''}`}>
                                    Top volume markets
                                </div>
                            </div>
                            {!fromStellarTicker && (
                                <div
                                    className="ListHeader_lowTradable"
                                    onClick={() => this.setState({
                                        zeroAssetsVisible: !fromStellarTicker && !zeroAssetsVisible,
                                    })}>
                                    Include 24h zero volume assets
                                    <input
                                        type="checkbox"
                                        readOnly
                                        checked={zeroAssetsVisible} />
                                    <span className="custom-checkbox">
                                        {zeroAssetsVisible && <img src={images['icon-tick-green']} alt="✓" />}
                                    </span>
                                </div>
                            )}
                            {fromStellarTicker &&
                                <div className="ListHeader_dropdown">
                                    <span>Base asset:</span>
                                    <AssetDropDown
                                        d={d}
                                        compactSize
                                        asset={baseAsset}
                                        onUpdate={asset => this.setState({ baseAsset: asset })} />
                                </div>
                            }
                        </div>
                        <AssetList
                            d={d}
                            showLowTradable={zeroAssetsVisible}
                            fromStellarTicker={fromStellarTicker}
                            baseAsset={baseAsset} />
                        <div className="AssetListFooter">
                            StellarTerm does not endorse any of these issuers. They are here for informational purposes
                            only.
                            <br />
                            To get listed on StellarTerm,{' '}
                            <a
                                href="https://github.com/stellarterm/stellarterm-directory"
                                target="_blank"
                                rel="nofollow noopener noreferrer">
                                please read the instructions on GitHub
                            </a>
                            .
                        </div>
                    </div>
                </div>

                <div className="so-back islandBack">
                    <CustomPairMenu d={d} />
                </div>
                <div className="so-back islandBack">
                    <CustomMarketPicker row d={d} />
                </div>
            </div>
        );
    }
}

Markets.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
