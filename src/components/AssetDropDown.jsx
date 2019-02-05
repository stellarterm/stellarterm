import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../lib/Driver';
import AssetCard2 from './AssetCard2';
import AssetCardList from './AssetCardList';

export default class AssetDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpenList: false,
        };
        this.handleClickOutside = (e) => {
            if (!this.node.contains(e.target)) {
                this.setState({
                    isOpenList: false,
                });
            }
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
        });
    }
    openList() {
        this.setState({
            isOpenList: !this.state.isOpenList,
        });
    }

    render() {
        const className = this.props.isBase ? 'AssetDropDown__left' : 'AssetDropDown__right';
        const name = this.props.isBase ? 'base' : 'counter';
        const arrow = this.state.isOpenList ? '▲' : '▼';
        return (
            <div
                className={`island__sub__division AssetDropDown__card ${className}`}
                ref={(node) => { this.node = node; }}>
                <div onClick={() => this.openList()}>
                    {this.props.asset ?
                        <AssetCard2
                            code={this.props.asset.code}
                            issuer={this.props.asset.issuer} /> :
                        <div className="AssetDropDown__empty">
                            <span>Set {name} asset</span>
                            <span>{arrow}</span>
                        </div>
                    }
                </div>
                {this.state.isOpenList ?
                    <AssetCardList
                        d={this.props.d}
                        onUpdate={(asset) => { this.onUpdate(asset); }}
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
};
