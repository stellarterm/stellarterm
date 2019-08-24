import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Debounce from 'awesome-debounce-promise';
import Driver from '../../../../lib/Driver';
import AssetCardMain from '../../AssetCard/AssetCardMain/AssetCardMain';
import AssetCardList from './AssetCardList/AssetCardList';
import directory from 'stellarterm-directory';
import images from '../../../../images';

const ENTER = 13;
const ARROW_UP = 38;
const ARROW_DOWN = 40;
const KEY_F = 70;

const ProcessedButtons = new Set([ARROW_UP, ARROW_DOWN, ENTER]);
const DEBOUNCE_TIME = 700;
const resolveAnchor = Debounce(StellarSdk.StellarTomlResolver.resolve, DEBOUNCE_TIME);
const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
const regexp = new RegExp(pattern);


export default class AssetDropDown extends React.Component {
    static getDomainForUnknownAsset(asset) {
        const unknownAssetsData = JSON.parse(localStorage.getItem('unknownAssetsData')) || [];
        const assetData = unknownAssetsData.find(assetLocalItem => (
            assetLocalItem.code === asset.code && assetLocalItem.issuer === asset.issuer
        ));
        if (!assetData) { return ''; }
        return (assetData.currency && assetData.currency.host) || assetData.host;
    }
    constructor(props) {
        super(props);

        this.dTicker = props.d.ticker;
        this.listenId = this.dTicker.event.listen(() => {
            this.forceUpdate();
        });

        this.state = {
            isOpenList: false,
            isFocused: false,
            inputCode: '',
            termAsset: null,
            activeCardIndex: null,
            currencies: [],
            loading: false,
        };

        this.handleClickOutside = (e) => {
            if (this.node.contains(e.target)) {
                return;
            }
            if (this.state.termAsset) {
                this.onUpdate(this.state.termAsset);
                this.setState({ inputCode: '' });
            }
            this.setState({
                isOpenList: false,
                isFocused: false,
                activeCardIndex: null,
                currencies: [],
            });
        };
    }

    componentWillMount() {
        this._mounted = true;
        document.addEventListener('mousedown', this.handleClickOutside, false);
    }

    componentDidMount() {
        // eslint-disable-next-line react/no-find-dom-node
        ReactDOM.findDOMNode(this).addEventListener('keyup', e => (e.keyCode === KEY_F ? e.stopPropagation() : null));
    }

    componentWillUnmount() {
        // eslint-disable-next-line react/no-find-dom-node
        ReactDOM.findDOMNode(this).removeEventListener('keyup', e => (e.keyCode === KEY_F ? e.stopPropagation() : null));
        this._mounted = false;
        document.removeEventListener('mousedown', this.handleClickOutside, false);
        this.dTicker.event.unlisten(this.listenId);
    }

    onUpdate({ code, issuer }) {
        this.props.onUpdate(new StellarSdk.Asset(code, issuer));
        this.setState({
            isOpenList: false,
            termAsset: null,
            isFocused: false,
        });
    }

    setActiveCardIndex({ keyCode }) {
        const { activeCardIndex } = this.state;

        if (!ProcessedButtons.has(keyCode) ||
            (keyCode === ENTER && activeCardIndex === null)) { return; }

        const assetsList = this.getFilteredAssets();
        const cardListLength = assetsList.length;

        if (cardListLength === 0) { return; }

        if (keyCode === ENTER) {
            this.onUpdate(assetsList[activeCardIndex]);
            return;
        }

        const currentIndex = activeCardIndex === null ? -1 : activeCardIndex;

        let nextIndex = keyCode === ARROW_DOWN ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex < 0) {
            nextIndex = cardListLength - 1;
        } else if (nextIndex === cardListLength) {
            nextIndex = 0;
        }

        this.setState({ activeCardIndex: nextIndex });
    }

    getFilteredAssets() {
        const { assets } = this.dTicker.data;
        const { account } = this.props.d.session;
        const { code, issuer } = this.props.exception || '';
        const { inputCode, currencies } = this.state;

        const unknownAssets = (account && account.getSortedBalances({ onlyUnknown: true })) || [];
        const filteredUnknownAssets = unknownAssets
            .filter(asset => (
                (asset.code.indexOf(inputCode.toUpperCase()) > -1) ||
                (asset.code.indexOf(inputCode.toLowerCase()) > -1) ||
                (this.constructor.getDomainForUnknownAsset(asset).indexOf(inputCode.toLowerCase()) > -1)
            ));

        const filteredCurrencies = currencies.filter(currency => (
            !assets.find(asset => ((asset.code === currency.code) && (asset.issuer === currency.issuer))) &&
            !unknownAssets.find(asset => ((asset.code === currency.code) && (asset.issuer === currency.issuer))) &&
            StellarSdk.StrKey.isValidEd25519PublicKey(currency.issuer)
        ));

        const isExceptionNative = this.props.exception && this.props.exception.isNative();

        return assets
            .filter((asset) => {
                const { unlisted } = directory.getAssetByAccountId(asset.code, asset.issuer) || {};
                return (
                    !unlisted &&
                    ((asset.code.indexOf(inputCode.toUpperCase()) > -1) ||
                        (asset.domain.indexOf(inputCode.toLowerCase()) > -1))
                );
            })
            .concat(filteredUnknownAssets)
            .concat(filteredCurrencies)
            .filter((asset) => {
                const isAssetNative = new StellarSdk.Asset(asset.code, asset.issuer).isNative();
                return (
                    ((asset.code !== code) || (asset.issuer !== issuer)) &&
                    !(isExceptionNative && isAssetNative)
                );
            });
    }

    async getAssetByDomain(domain) {
        this.setState({ loading: true });
        setTimeout(() => {
            if (this._mounted) {
                this.setState({ loading: false });
            }
        }, 5000);
        try {
            const resolved = await resolveAnchor(domain);
            if (!resolved.CURRENCIES) {
                this.setState({ loading: false });
                return;
            }
            this.setState({
                currencies: resolved.CURRENCIES,
                loading: false,
            });
        } catch (e) {
            this.setState({ loading: false });
        }
    }

    openListByFocus() {
        this.setState({
            isOpenList: true,
            activeCardIndex: null,
        });
    }

    openList() {
        if (this.props.clear) {
            this.props.clear();
            this.setState({ termAsset: this.props.asset });
        }
        if (this.state.termAsset && this.state.isOpenList) {
            this.onUpdate(this.state.termAsset);
            this.setState({ inputCode: '' });
        }
        this.setState({
            isOpenList: !this.state.isOpenList,
            isFocused: !this.state.isOpenList,
            activeCardIndex: null,
            currencies: [],
        });
    }

    handleInput(e) {
        e.preventDefault();
        const { value } = e.target;

        this.setState({
            activeCardIndex: null,
            inputCode: value,
            currencies: [],
        });

        if (regexp.test(value)) {
            this.getAssetByDomain(value);
        }
    }

    render() {
        const arrowClassName = this.state.isOpenList ? 'AssetDropDown__arrowUp' : 'AssetDropDown__arrowDown';
        const assetDropDownClassName = this.state.isOpenList ? 'AssetDropDown_isOpen' : null;

        return (
            <div
                className="island__sub__division AssetDropDown__card"
                ref={(node) => { this.node = node; }}>
                <div>
                    {this.props.asset ?
                        <div className="AssetDropDown__full" onClick={() => this.openList()}>
                        <AssetCardMain
                            d={this.props.d}
                            code={this.props.asset.code}
                            issuer={this.props.asset.issuer} />
                        </div> :
                        <div className={`AssetDropDown__empty ${assetDropDownClassName}`}>
                            <input
                                autoFocus={this.state.isFocused}
                                key={this.state.isFocused}
                                onFocus={() => this.openListByFocus()}
                                className="AssetDropDown__search"
                                type="text"
                                onChange={e => this.handleInput(e)}
                                onKeyUp={e => this.setActiveCardIndex(e)}
                                value={this.state.inputCode}
                                placeholder="Type asset code or domain name" />
                        </div>
                    }
                    {this.state.loading ?
                        <div>
                            <img
                                src={images['icon-circle-preloader-gif']}
                                className="AssetDropDown__arrowUp load"
                                alt="load" />
                        </div> :
                        <img
                            src={images.dropdown}
                            alt="▼"
                            className={arrowClassName}
                            onClick={() => this.openList()} />}
                </div>
                {this.state.isOpenList ?
                    <AssetCardList
                        d={this.props.d}
                        host={this.state.currencies.length ? this.state.inputCode : null}
                        onUpdate={(asset) => { this.onUpdate(asset); }}
                        assetsList={this.getFilteredAssets()}
                        activeCardIndex={this.state.activeCardIndex} /> :
                    null
                }
            </div>
        );
    }
}

AssetDropDown.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    exception: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    onUpdate: PropTypes.func,
    clear: PropTypes.func,
};
