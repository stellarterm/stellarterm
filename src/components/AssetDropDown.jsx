import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../lib/Driver';
import AssetCard2 from './AssetCard2';
import AssetListDropDown from './AssetListDropDown';

export default class AssetDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpenList: false,
        };

        this.onUpdate = (asset) => {
            this.props.onUpdate(asset);
            this.setState({
                isOpenList: false,
            });
        };
        this.openList = () => {
            this.setState({
                isOpenList: !this.state.isOpenList,
            });
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

    render() {
        let className = 'AssetDropDown__right';
        if (this.props.isBase) {
            className = 'AssetDropDown__left';
        }
        return (
            <div
                className={`island__sub__division AssetDropDown__card ${className}`}
                ref={(node) => { this.node = node; }}>
                <div onClick={this.openList}>
                    {this.props.asset ?
                        <AssetCard2
                            code={this.props.asset.code}
                            issuer={this.props.asset.issuer} /> :
                        <div className="AssetDropDown__empty">
                            {this.props.isBase ? <span>Set base asset</span> : <span>Set counter asset</span>}
                            {this.state.isOpenList ? <span>&#9650;</span> : <span>&#9660;</span>}
                        </div>
                    }
                </div>
                {this.state.isOpenList ?
                    <AssetListDropDown
                        d={this.props.d}
                        onUpdate={this.onUpdate}
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
