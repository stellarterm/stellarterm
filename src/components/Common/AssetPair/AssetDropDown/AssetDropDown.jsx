import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import AssetCard2 from '../../AssetCard2/AssetCard2';
import AssetCardList from './AssetCardList/AssetCardList';
import directory from '../../../../directory';
import images from '../../../../images';

const ENTER = 13;
const ARROW_UP = 38;
const ARROW_DOWN = 40;

const ProcessedButtons = new Set([ARROW_UP, ARROW_DOWN, ENTER]);


export default class AssetDropDown extends React.Component {
    static getDomainForUnknownAsset(asset) {
        const unknownAssetsData = JSON.parse(localStorage.getItem('unknownAssetsData')) || [];
        const assetData = unknownAssetsData.find(assetLocalItem => (
            assetLocalItem.code === asset.code && assetLocalItem.issuer === asset.issuer
        ));

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
            code: '',
            termAsset: null,
            activeCardIndex: null,
        };

        this.handleClickOutside = (e) => {
            if (this.node.contains(e.target)) {
                return;
            }
            if (this.state.termAsset) {
                this.onUpdate(this.state.termAsset);
                this.setState({ code: '' });
            }
            this.setState({
                isOpenList: false,
                isFocused: false,
                activeCardIndex: null,
            });
        };
    }

    componentWillMount() {
        document.addEventListener('mousedown', this.handleClickOutside, false);
    }

    componentWillUnmount() {
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

        const assetsList = this.getFilterAssets();
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

    getFilterAssets() {
        const { assets } = this.dTicker.data;
        const { account } = this.props.d.session;
        const unknownAssets = (account && account.getSortedBalances({ onlyUnknown: true })) || [];

        const { code, issuer } = this.props.exception || '';
        const isExceptionNative = this.props.exception && this.props.exception.isNative();

        return assets
            .filter((asset) => {
                const { unlisted } = directory.getAssetByAccountId(asset.code, asset.issuer) || {};
                const isAssetNative = new StellarSdk.Asset(asset.code, asset.issuer).isNative();
                return (
                    !unlisted && ((asset.code !== code) || (asset.issuer !== issuer)) &&
                    !(isExceptionNative && isAssetNative) &&
                    ((asset.code.indexOf(this.state.code.toUpperCase()) > -1) ||
                        (asset.domain.indexOf(this.state.code.toLowerCase()) > -1))
                );
            })
            .concat(unknownAssets
                .filter(asset => (
                    (asset.code.indexOf(this.state.code.toUpperCase()) > -1) ||
                    (asset.code.indexOf(this.state.code) > -1) ||
                    (this.constructor.getDomainForUnknownAsset(asset).indexOf(this.state.code.toLowerCase()) > -1)
                )),
            );
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
            this.setState({ code: '' });
        }
        this.setState({
            isOpenList: !this.state.isOpenList,
            isFocused: !this.state.isOpenList,
            activeCardIndex: null,
        });
    }

    handleInput(e) {
        e.preventDefault();
        this.setState({
            activeCardIndex: null,
            code: e.target.value,
        });
    }


    render() {
        const name = this.props.isBase ? 'base' : 'counter';
        const arrowClassName = this.state.isOpenList ? 'AssetDropDown__arrowUp' : 'AssetDropDown__arrowDown';
        const assetDropDownClassName = this.state.isOpenList ? 'AssetDropDown_isOpen' : null;

        return (
            <div
                className="island__sub__division AssetDropDown__card"
                ref={(node) => { this.node = node; }}>
                <div>
                    {this.props.asset ?
                        <div className="AssetDropDown__full" onClick={() => this.openList()}>
                        <AssetCard2
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
                                value={this.state.code}
                                placeholder={`Set ${name} asset`} />
                        </div>
                    }
                    <img src={images.dropdown} alt="▼" className={arrowClassName} onClick={() => this.openList()} />
                </div>
                {this.state.isOpenList ?
                    <AssetCardList
                        d={this.props.d}
                        onUpdate={(asset) => { this.onUpdate(asset); }}
                        assetsList={this.getFilterAssets()}
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
    isBase: PropTypes.bool,
    clear: PropTypes.func,
};
