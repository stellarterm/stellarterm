import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../lib/driver/Driver';
import AssetList from '../Common/AssetList/AssetList';
import CustomPairMenu from './CustomPairMenu/CustomPairMenu';
import CustomMarketPicker from './CustomMarketPicker/CustomMarketPicker';
import SearchByAnchor from '../Common/SearchByAnchor/SearchByAnchor';
import AssetDropDown from '../Common/AssetPair/AssetDropDown/AssetDropDown';
import TopVolumeAssets from './TopVolumeAssets/TopVolumeAssets';
import Stellarify from '../../lib/helpers/Stellarify';
import NotFound from '../NotFound/NotFound';
import images from '../../images';

const KNOWN_MARKETS_ROUTE = '/markets/';
const TOP_VOLUME_ROUTE = '/markets/top/';


export default class Markets extends React.Component {
    constructor(props) {
        super(props);
        this.urlSearchParams = new URLSearchParams(window.location.search);
        this.state = {
            zeroAssetsVisible: false,
            baseAsset: null,
        };
    }

    componentDidMount() {
        if (window.location.pathname === TOP_VOLUME_ROUTE) {
            this.getBaseAssetFromUrl();
        }

        this.unlisten = this.props.history.listen(location => {
            this.urlSearchParams = new URLSearchParams(location.search);

            if (location.pathname === TOP_VOLUME_ROUTE) {
                this.getBaseAssetFromUrl();
            }

            if (location.pathname === KNOWN_MARKETS_ROUTE) {
                if (this.urlSearchParams.has('base')) {
                    this.urlSearchParams.delete('base');
                    this.props.history.replace(`?${this.urlSearchParams.toString()}`);
                }
            }
        });
    }

    componentWillUnmount() {
        this.unlisten();
    }

    getBaseAssetFromUrl() {
        const slug = this.urlSearchParams.get('base');

        if (this.state.baseAsset && Stellarify.assetToSlug(this.state.baseAsset) === slug) {
            return;
        }

        if (!slug) {
            this.urlSearchParams.set('base', 'XLM-native');
            this.props.history.replace(`?${this.urlSearchParams.toString()}`);

            this.setState({ baseAsset: StellarSdk.Asset.native() });
            return;
        }
        try {
            this.setState({ baseAsset: Stellarify.parseAssetSlug(slug) });
        } catch (e) {
            console.warn(e);
            this.setState({ baseAsset: null });
        }
    }

    toggleMarketsTables(isTop) {
        this.props.history.push(`${isTop ? TOP_VOLUME_ROUTE : KNOWN_MARKETS_ROUTE}?${this.urlSearchParams.toString()}`);
    }

    render() {
        const { props } = this;
        const { d } = this.props;
        const { zeroAssetsVisible, fromStellarTicker } = this.state;

        return (
            <div>
                <div className="so-back islandBack islandBack--t">
                    <SearchByAnchor
                        d={d}
                        tradeLink
                        withUrlParams
                        {...props}
                    />
                </div>
                <div className="so-back islandBack">
                    <div className="island">
                        <div className="AssetList_Header">
                            <div className="AssetList_Tabs">
                                <div
                                    onClick={() => this.toggleMarketsTables(false)}
                                    className={`ListHeader_Title ${window.location.pathname === KNOWN_MARKETS_ROUTE ? 'active' : ''}`}
                                >
                                    Known assets
                                </div>
                                <div
                                    onClick={() => this.toggleMarketsTables(true)}
                                    className={`ListHeader_Title ${window.location.pathname === TOP_VOLUME_ROUTE ? 'active' : ''}`}
                                >
                                    Top volume markets
                                </div>
                            </div>
                            <Switch>
                                <Route
                                    path={KNOWN_MARKETS_ROUTE}
                                    exact
                                    render={() =>
                                        <React.Fragment>
                                            <div
                                                className="ListHeader_lowTradable"
                                                onClick={() => this.setState({
                                                    zeroAssetsVisible: !fromStellarTicker && !zeroAssetsVisible,
                                                })}
                                            >
                                                Include 24h zero volume assets
                                                <input
                                                    type="checkbox"
                                                    readOnly
                                                    checked={zeroAssetsVisible}
                                                />
                                                <span className="custom-checkbox">
                                                    {zeroAssetsVisible && <img src={images['icon-tick-green']} alt="✓" />}
                                                </span>
                                            </div>
                                        </React.Fragment>
                                    }
                                />
                                <Route
                                    path={TOP_VOLUME_ROUTE}
                                    render={() =>
                                        <React.Fragment>
                                            <div className="ListHeader_dropdown">
                                                <span>Base asset:</span>
                                                <AssetDropDown
                                                    d={d}
                                                    compactSize
                                                    asset={this.state.baseAsset}
                                                    onUpdate={asset => {
                                                        this.setState({ baseAsset: asset });
                                                        this.urlSearchParams.set('base', Stellarify.assetToSlug(asset));
                                                        this.props.history.push(`?${this.urlSearchParams.toString()}`);
                                                    }}
                                                />
                                            </div>
                                        </React.Fragment>
                                    }
                                />
                            </Switch>
                        </div>
                        <Switch>
                            <Route
                                path={KNOWN_MARKETS_ROUTE}
                                exact
                                render={() =>
                                    <AssetList
                                        d={d}
                                        showLowTradable={zeroAssetsVisible}
                                    />
                                }
                            />
                            <Route
                                path={TOP_VOLUME_ROUTE}
                                render={() =>
                                    <TopVolumeAssets
                                        d={d}
                                        baseAsset={this.state.baseAsset}
                                    />
                                }
                            />
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
                                rel="nofollow noopener noreferrer"
                            >
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
    history: PropTypes.objectOf(PropTypes.any),
};
