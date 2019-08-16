import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import directory from 'stellarterm-directory';
import screenfull from 'screenfull';
import Driver from '../../lib/Driver';
import Stellarify from '../../lib/Stellarify';
import ManageOffers from './ManageOffers/ManageOffers';
import OfferTables from './OfferTables/OfferTables';
import OfferMakers from './OfferMakers/OfferMakers';
import PairPicker from './PairPicker/PairPicker';
import LightweightChart from './LightweightChart/LightweightChart';
import Ellipsis from '../Common/Ellipsis/Ellipsis';
import Generic from '../Common/Generic/Generic';
import AssetPair from '../Common/AssetPair/AssetPair';
import images from '../../images';
import ChartActionAlert from './ChartActionAlert/ChartActionAlert';
import * as converterOHLC from './LightweightChart/ConverterOHLC';
import { PriceScaleMode } from '../../../node_modules/lightweight-charts/dist/lightweight-charts.esm.production';

const BAR = 'barChart';
const CANDLE = 'candlestickChart';
const LINE = 'lineChart';
const keyF = 70;
const isMicrosoftBrowser = document.documentMode || /Edge/.test(window.navigator.userAgent);

export default class Exchange extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wrongUrl: false,
        };
        this.unsub = this.props.d.orderbook.event.sub(() => {
            this.forceUpdate();
        });
        this.unsubSession = this.props.d.session.event.sub(() => {
            this.forceUpdate();
        });

        this.state = {
            chartType: 'lineChart',
            fullscreenMode: false,
            showAction: false,
            timeFrame: converterOHLC.FRAME_HOUR,
            scaleMode: PriceScaleMode.Normal,
        };
        this._handleKeyUp = this._handleKeyUp.bind(this);
        this._escExitFullscreen = this._escExitFullscreen.bind(this);
    }

    componentWillMount() {
        this.getTradePair();
        window.scrollTo(0, 0);
    }

    componentDidMount() {
        document.addEventListener('keyup', this._handleKeyUp);
        // For handle esc browser from fullscreen
        document.addEventListener('webkitfullscreenchange', this._escExitFullscreen);
        document.addEventListener('mozfullscreenchange', this._escExitFullscreen);
        document.addEventListener('fullscreenchange', this._escExitFullscreen);
        document.addEventListener('MSFullscreenChange', this._escExitFullscreen);
    }

    componentWillUnmount() {
        this.unsub();
        this.unsubSession();
        document.removeEventListener('keyup', this._handleKeyUp);

        if (this.state.fullscreenMode) {
            this.toggleFullScreen();
        }
    }

    getChartScreenshot() {
        const chartIsDrawn = this.child.state[this.state.timeFrame].trades.length !== 0;

        if (chartIsDrawn) {
            this.child.getScreenshot();
            this.setState({ showAction: true });
            setTimeout(() => {
                this.setState({ showAction: false });
            }, 4000);
        }
    }

    getChartSwitcherPanel() {
        const { chartType, fullscreenMode } = this.state;
        const fullscreenBtn = fullscreenMode ? (
            <img src={images['icon-fullscreen-minimize']} alt="F" onClick={() => this.toggleFullScreen()} />
        ) : (
            <img src={images['icon-fullscreen']} alt="F" onClick={() => this.toggleFullScreen()} />
        );

        const downloadScreenshotBtn = (
            <img
                className="screenshot-btn"
                src={images['icon-photo']}
                alt="Screenshot"
                onClick={() => this.getChartScreenshot()} />
        );

        return (
            <div className="island__header chart_Switcher">
                <div className="switch_Tabs">
                    <a
                        onClick={() => this.setState({ chartType: 'lineChart' })}
                        className={chartType === LINE ? 'activeChart' : ''}>
                        <img src={images['icon-lineChart']} alt="line" />
                        <span>Linechart</span>
                    </a>
                    <a
                        onClick={() => this.setState({ chartType: 'candlestickChart' })}
                        className={chartType === CANDLE ? 'activeChart' : ''}>
                        <img src={images['icon-candleChart']} alt="candle" />
                        <span>Candlestick</span>
                    </a>
                    <a
                        onClick={() => this.setState({ chartType: 'barChart' })}
                        className={chartType === BAR ? 'activeChart' : ''}>
                        <img src={images['icon-barChart']} alt="bar" />
                        <span>Bar chart</span>
                    </a>
                </div>
                <div className="fullscreen_Block">
                    {!isMicrosoftBrowser ? downloadScreenshotBtn : null}
                    {screenfull.enabled ? fullscreenBtn : null}
                </div>
            </div>
        );
    }

    getTradePair() {
        const { pathname } = window.location;
        const urlParts = pathname.split('/');
        if (urlParts.length === 4) {
            try {
                const baseBuying = Stellarify.parseAssetSlug(urlParts[2]);
                const counterSelling = Stellarify.parseAssetSlug(urlParts[3]);
                this.props.d.orderbook.handlers.setOrderbook(baseBuying, counterSelling);
            } catch (e) {
                console.error(e);
                this.setState({ wrongUrl: true });
            }
            return;
        }
        if (!this.props.d.orderbook.data.ready) {
            const baseBuying = new StellarSdk.Asset('MOBI', 'GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH');
            const counterSelling = StellarSdk.Asset.native();
            this.props.d.orderbook.handlers.setOrderbook(baseBuying, counterSelling);
            window.history.pushState({}, null, `${Stellarify.pairToExchangeUrl(baseBuying, counterSelling)}`);
            return;
        }
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        window.history.pushState({}, null, `${Stellarify.pairToExchangeUrl(baseBuying, counterSelling)}`);
    }

    toggleFullScreen() {
        if (screenfull.isFullscreen) {
            this.setState({ fullscreenMode: false });
            screenfull.exit();
        } else if (!screenfull.isFullscreen) {
            screenfull.request();
            this.setState({ fullscreenMode: true });
            window.scrollTo(0, 0);
        }
    }

    _escExitFullscreen() {
        const noBrowserFullscreen =
            !document.fullscreenElement &&
            !document.webkitIsFullScreen &&
            !document.mozFullScreen &&
            !document.msFullscreenElement;

        if (noBrowserFullscreen) {
            this.setState({ fullscreenMode: false });
        }
    }

    _handleKeyUp({ keyCode }) {
        if (keyCode === keyF && screenfull.enabled) {
            this.toggleFullScreen();
        }
    }

    checkOrderbookWarning() {
        const ticker = this.props.d.ticker;
        const data = this.props.d.orderbook.data;

        if (ticker.ready) {
            const baseSlug = Stellarify.assetToSlug(data.baseBuying);
            const counterSlug = Stellarify.assetToSlug(data.counterSelling);
            let aggregateDepth = 0;

            if (baseSlug !== 'XLM-native') {
                ticker.data.assets.forEach((asset) => {
                    if (asset.slug === baseSlug) {
                        aggregateDepth += asset.depth10_USD;
                    }
                });
            }

            if (counterSlug !== 'XLM-native') {
                ticker.data.assets.forEach((asset) => {
                    if (asset.slug === counterSlug) {
                        aggregateDepth += asset.depth10_USD;
                    }
                });
            }

            if (aggregateDepth < 100) {
                return (
                    <div className="Exchange__warning">
                        <div className="s-alert s-alert--warning">
                            The orderbook for this pair is thin. To get a better price, create an offer without taking
                            an existing one.
                        </div>
                    </div>
                );
            }
        }
        return null;
    }

    render() {
        if (this.state.wrongUrl) {
            return (
                <Generic title="Pick a market">
                    Exchange url was invalid. To begin, go to the <Link to="/markets/">market list page</Link> and pick
                    a trading pair.
                </Generic>
            );
        }

        if (!this.props.d.orderbook.data.ready) {
            return this.state.fullscreenMode ? (
                <div className="fullscreen_Loading">
                    Loading orderbook data from Horizon
                    <Ellipsis />
                </div>
            ) : (
                <Generic title="Loading orderbook">
                    Loading orderbook data from Horizon
                    <Ellipsis />
                </Generic>
            );
        }

        const thinOrderbookWarning = this.checkOrderbookWarning();
        const data = this.props.d.orderbook.data;
        let warningWarning;

        const directoryAsset = directory.getAssetByAccountId(data.baseBuying.code, data.baseBuying.issuer);
        if (directoryAsset !== null && directoryAsset.warning !== undefined) {
            warningWarning = (
                <div className="Exchange__warning">
                    <div className="s-alert s-alert--warning">{directoryAsset.warning}</div>
                </div>
            );
        }

        let offermakers;
        if (directoryAsset !== null && directoryAsset.disabled !== undefined) {
            offermakers = (
                <div className="Exchange__orderbookDisabled">
                    Offer making has been disabled for this pair. You may still cancel your existing offers below.
                </div>
            );
        } else {
            offermakers = <OfferMakers d={this.props.d} />;
        }

        const { chartType, fullscreenMode, timeFrame, scaleMode, showAction } = this.state;
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const chartSwitcherPanel = this.getChartSwitcherPanel();
        const pairName = `${baseBuying.code}/${counterSelling.code}`;
        const pairPickerClass = `so-back islandBack islandBack--t ${fullscreenMode ? 'hidden-pair' : ''}`;

        return (
            <div>
                <div className={pairPickerClass}>
                    <PairPicker d={this.props.d} />
                </div>
                {fullscreenMode ? (
                    <AssetPair
                        baseBuying={baseBuying}
                        counterSelling={counterSelling}
                        fullscreen={fullscreenMode}
                        d={this.props.d}
                        swap
                        dropdown />
                ) : null}
                <div className={`so-back islandBack ${fullscreenMode ? 'fullScreenChart' : ''}`}>
                    <div className="island ChartChunk">
                        {chartSwitcherPanel}
                        {showAction ? <ChartActionAlert text={'Chart screenshot downloaded!'} /> : null}
                        <LightweightChart
                            d={this.props.d}
                            lineChart={chartType === LINE}
                            candlestickChart={chartType === CANDLE}
                            barChart={chartType === BAR}
                            timeFrame={timeFrame}
                            scaleMode={scaleMode}
                            fullscreen={fullscreenMode}
                            pairName={pairName}
                            ref={(instance) => {
                                this.child = instance;
                            }}
                            onUpdate={(stateName, stateValue) => this.setState({ [stateName]: stateValue })} />
                    </div>
                </div>
                <div className="so-back islandBack">
                    <div className="island Exchange_orderbook">
                        <div className="island__header">Orderbook</div>
                        {thinOrderbookWarning}
                        {warningWarning}
                        <div>
                            {offermakers}
                            <div className="island__separator" />
                            <OfferTables d={this.props.d} />
                        </div>
                    </div>
                </div>
                <div className="so-back islandBack">
                    <div className="island">
                        <div className="island__header">Manage offers</div>
                        <ManageOffers d={this.props.d} />
                    </div>
                </div>
            </div>
        );
    }
}

Exchange.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
