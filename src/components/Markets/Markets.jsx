import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';
import AssetList from '../Common/AssetList/AssetList';
import CustomPairMenu from './CustomPairMenu/CustomPairMenu';
import CustomMarketPicker from './CustomMarketPicker/CustomMarketPicker';
import SearchByAnchor from '../Common/SearchByAnchor/SearchByAnchor';

import images from '../../images';

export default class Markets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            zeroAssetsVisible: false,
            fromStellarTicker: false,
        };
    }

    render() {
        const { d } = this.props;
        const { zeroAssetsVisible, fromStellarTicker } = this.state;

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
                                    Top volume assets
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
                        </div>
                        <AssetList d={d} showLowTradable={zeroAssetsVisible} fromStellarTicker={fromStellarTicker} />
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
