import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Debounce from 'awesome-debounce-promise';
import directory from 'stellarterm-directory';
import Driver from '../../../../lib/driver/Driver';
import AssetCardMain from '../../AssetCard/AssetCardMain/AssetCardMain';
import images from '../../../../images';
import AssetCardInRow from '../../AssetCard/AssetCardInRow/AssetCardInRow';
import { CACHED_ASSETS_ALIAS, getAssetString } from '../../../../lib/driver/driverInstances/Session';
import AssetCardList from './AssetCardList/AssetCardList';

const ENTER = 13;
const ARROW_UP = 38;
const ARROW_DOWN = 40;
const KEY_F = 70;

const ProcessedButtons = new Set([ARROW_UP, ARROW_DOWN, ENTER]);
const DEBOUNCE_TIME = 700;
const resolveAnchor = Debounce(StellarSdk.StellarTomlResolver.resolve, DEBOUNCE_TIME);
// eslint-disable-next-line no-useless-escape
const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
const regexp = new RegExp(pattern);


export default class AssetDropDown extends React.Component {
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

        this.handleClickOutside = e => {
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

    componentDidMount() {
        this._mounted = true;
        document.addEventListener('mousedown', this.handleClickOutside, false);
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
        this.props.onUpdate(issuer ? new StellarSdk.Asset(code, issuer) : new StellarSdk.Asset.native());
        this.setState({
            isOpenList: false,
            termAsset: null,
            isFocused: false,
        });
    }

    setActiveCardIndex({ keyCode }) {
        const { activeCardIndex } = this.state;
        const assetsList = this.getFilteredAssets();
        const cardListLength = assetsList.length;

        if (!ProcessedButtons.has(keyCode) ||
            (keyCode === ENTER && activeCardIndex === null)) { return; }

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
        const inputCodeLowerCased = inputCode.toLowerCase();

        const assetsData = new Map(JSON.parse(localStorage.getItem(CACHED_ASSETS_ALIAS) || '[]'));

        const unknownAssets = (account && account.getSortedBalances({ onlyUnknown: true })) || [];
        const filteredUnknownAssets = unknownAssets
            .filter(asset => {
                if (asset.code.toLowerCase().includes(inputCodeLowerCased)) {
                    return true;
                }

                const assetData = assetsData.get(getAssetString(asset));
                const domain = assetData && assetData.home_domain;

                return domain && domain.toLowerCase().includes(inputCodeLowerCased);
            });

        const filteredCurrencies = currencies.filter(currency => (
            !assets.find(asset => ((asset.code === currency.code) && (asset.issuer === currency.issuer))) &&
            !unknownAssets.find(asset => ((asset.code === currency.code) && (asset.issuer === currency.issuer))) &&
            StellarSdk.StrKey.isValidEd25519PublicKey(currency.issuer)
        ));

        const isExceptionNative = this.props.exception && this.props.exception.isNative();

        const filteredDirectoryAssets = assets
            .filter(asset => {
                const { unlisted, disabled } = directory.getAssetByAccountId(asset.code, asset.issuer) || {};
                return (
                    !unlisted && !disabled &&
                    (asset.code.toLowerCase().includes(inputCodeLowerCased) ||
                        asset.domain.toLowerCase().includes(inputCodeLowerCased))
                );
            });

        return [...filteredDirectoryAssets, ...filteredUnknownAssets, ...filteredCurrencies]
            .filter(asset => {
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
        if (this.state.activeCardIndex === null) {
            this.setState({
                isOpenList: true,
                activeCardIndex: 0,
            });
        } else { this.setState({ isOpenList: true }); }
    }

    openList() {
        this.setState({ termAsset: this.props.asset, inputCode: '' });
        if (this.state.termAsset && this.state.isOpenList) {
            this.onUpdate(this.state.termAsset);
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
            activeCardIndex: 0,
            inputCode: value,
            currencies: [],
        });

        if (regexp.test(value)) {
            this.getAssetByDomain(value);
        }
    }

    render() {
        const { isOpenList } = this.state;
        const { compactSize } = this.props;
        const isOpenClass = isOpenList ? 'AssetDropDown_isOpen' : '';
        const isCompactClass = compactSize ? 'AssetDropDown__compactSize' : '';

        return (
            <div
                className={`island__sub__division AssetDropDown__card ${isCompactClass} ${isOpenClass}`}
                ref={node => { this.node = node; }}
            >
                <div>
                    {(this.props.asset && !isOpenList) ?
                        <div className="AssetDropDown__full" onClick={() => this.openList()}>
                            {compactSize ?
                                <AssetCardInRow
                                    d={this.props.d}
                                    code={this.props.asset.code}
                                    issuer={this.props.asset.issuer}
                                /> :
                                <AssetCardMain
                                    d={this.props.d}
                                    code={this.props.asset.code}
                                    issuer={this.props.asset.issuer}
                                />}
                        </div> :
                        <div className="AssetDropDown__empty">
                            <input
                                autoFocus={this.state.isFocused}
                                key={this.state.isFocused}
                                onFocus={() => this.openListByFocus()}
                                className="AssetDropDown__search"
                                type="text"
                                onChange={e => this.handleInput(e)}
                                onKeyUp={e => this.setActiveCardIndex(e)}
                                value={this.state.inputCode}
                                placeholder={compactSize ? 'Type code or domain' : 'Type asset code or domain name'}
                            />
                        </div>
                    }
                    {this.state.loading ?
                        <div>
                            <img
                                src={images['icon-circle-preloader-gif']}
                                className="AssetDropDown__arrow load"
                                alt="load"
                            />
                        </div> :
                        <img
                            src={images.dropdown}
                            alt="▼"
                            className="AssetDropDown__arrow"
                            onClick={() => this.openList()}
                        />}
                </div>
                {this.state.isOpenList ?
                    <AssetCardList
                        compactSize={compactSize}
                        d={this.props.d}
                        host={this.state.currencies.length ? this.state.inputCode : null}
                        onUpdate={asset => { this.onUpdate(asset); }}
                        assetsList={this.getFilteredAssets()}
                        activeCardIndex={this.state.activeCardIndex}
                    /> :
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
    compactSize: PropTypes.bool,
};
