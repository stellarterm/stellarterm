import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, NavLink } from 'react-router-dom';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../lib/Driver';
import AssetList from '../Common/AssetList/AssetList';
import CustomPairMenu from './CustomPairMenu/CustomPairMenu';
import CustomMarketPicker from './CustomMarketPicker/CustomMarketPicker';
import SearchByAnchor from '../Common/SearchByAnchor/SearchByAnchor';
import AssetDropDown from '../Common/AssetPair/AssetDropDown/AssetDropDown';
import TopVolumeAssets from './TopVolumeAssets/TopVolumeAssets';
import Stellarify from '../../lib/Stellarify';
import NotFound from '../NotFound/NotFound';
import images from '../../images';


export default class Markets extends React.Component {
    static getBaseAssetFromUrl() {
        const slug = new URLSearchParams(window.location.search).get('base');
        if (!slug) {
            window.history.replaceState({}, '', '/markets/top?base=XLM-native');
            return StellarSdk.Asset.native();
        }
        try {
            return Stellarify.parseAssetSlug(slug);
        } catch (e) {
            console.warn(e);
            return null;
        }
    }
    constructor(props) {
        super(props);
        this.state = {
            zeroAssetsVisible: false,
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
                                <NavLink
                                    to="/markets/"
                                    exact
                                    className="ListHeader_Title"
                                    activeClassName="active">
                                    Known assets
                                </NavLink>
                                <NavLink
                                    to="/markets/top/"
                                    className="ListHeader_Title"
                                    activeClassName="active">
                                    Top volume markets
                                </NavLink>
                            </div>
                            <Switch>
                                <Route
                                    path="/markets/"
                                    exact
                                    render={() =>
                                        <React.Fragment>
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
                                        </React.Fragment>
                                    } />
                                <Route
                                    path="/markets/top/"
                                    render={() =>
                                        <React.Fragment>
                                            <div className="ListHeader_dropdown">
                                                <span>Base asset:</span>
                                                <AssetDropDown
                                                    d={d}
                                                    compactSize
                                                    asset={this.constructor.getBaseAssetFromUrl()}
                                                    onUpdate={(asset) => {
                                                        this.setState({ baseAsset: asset });
                                                        window.history.pushState(
                                                            {},
                                                            null,
                                                            `/markets/top?base=${Stellarify.assetToSlug(asset)}`,
                                                        );
                                                    }} />
                                            </div>
                                        </React.Fragment>
                                    } />
                            </Switch>
                        </div>
                        <Switch>
                            <Route
                                path="/markets/"
                                exact
                                render={() =>
                                    <AssetList
                                        d={d}
                                        showLowTradable={zeroAssetsVisible} />
                                } />
                            <Route
                                path="/markets/top/"
                                render={() =>
                                    <TopVolumeAssets
                                        d={d}
                                        baseAsset={this.constructor.getBaseAssetFromUrl()} />
                                } />
                            <Route render={() => <NotFound withoutWrapper />} />
                        </Switch>

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
