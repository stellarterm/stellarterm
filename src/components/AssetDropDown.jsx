import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../lib/Driver';
import AssetCard2 from './AssetCard2';
import AssetCardList from './AssetCardList';

const images = require('./../images');

export default class AssetDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpenList: false,
            code: '',
            termAsset: null,
        };
        this.handleClickOutside = (e) => {
            if (this.node.contains(e.target)) {
                return;
            }
            if (this.state.termAsset) {
                this.onUpdate(this.state.termAsset);
            }
            this.setState({
                isOpenList: false,
            });
        };
    }

    componentWillMount() {
        document.addEventListener('mousedown', this.handleClickOutside, false);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside, false);
    }

    onUpdate(asset) {
        this.props.onUpdate(asset);
        this.setState({
            isOpenList: false,
            termAsset: null,
        });
    }
    openList() {
        if (this.props.clear) {
            this.props.clear();
            this.setState({ termAsset: this.props.asset });
        }
        if (this.state.termAsset && this.state.isOpenList) {
            this.onUpdate(this.state.termAsset);
        }
        this.setState({
            isOpenList: !this.state.isOpenList,
            code: '',
        });
    }
    handleInput(e) {
        e.preventDefault();
        this.setState({
            isOpenList: true,
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
                        <AssetCard2
                            code={this.props.asset.code}
                            issuer={this.props.asset.issuer} /> :
                        <div className={`AssetDropDown__empty ${assetDropDownClassName}`}>
                            <input
                                className="AssetDropDown__search"
                                type="text"
                                onChange={e => this.handleInput(e)}
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
                        code={this.state.code}
                        exception={this.props.exception} /> :
                    null
                }
            </div>
        );
    }
}

AssetDropDown.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.objectOf(PropTypes.string),
    exception: PropTypes.objectOf(PropTypes.string),
    onUpdate: PropTypes.func,
    isBase: PropTypes.bool,
    clear: PropTypes.func,
};
