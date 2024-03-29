import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import Driver from '../../../lib/driver/Driver';
import Stellarify from '../../../lib/helpers/Stellarify';
import SwitchBtn from '../../Basics/SwitchBtn/SwitchBtn';
import AssetCardMain from '../AssetCard/AssetCardMain/AssetCardMain';
import AssetDropDown from './AssetDropDown/AssetDropDown';

export default class AssetPair extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            baseBuying: this.props.baseBuying,
            counterSelling: this.props.counterSelling,
            showError: false,
        };
    }

    getAssetCard(dropdown, d, assetType) {
        if (!this.props[assetType]) {
            return <div className="AssetPair__card" />;
        }

        const isBase = assetType === 'baseBuying';
        const exception = isBase ? this.props.counterSelling : this.props.baseBuying;

        return (
            <div className="AssetPair__card">
                {dropdown ? (
                    <AssetDropDown
                        onUpdate={asset => {
                            this.assetUpdate(asset, assetType);
                        }}
                        d={d}
                        asset={this.state[assetType]}
                        exception={exception}
                    />
                ) : (
                    <AssetCardMain
                        code={this.props[assetType].getCode()}
                        issuer={this.props[assetType].getIssuer()}
                        d={d}
                    />
                )}
            </div>
        );
    }

    getSeparator(swap) {
        if (!swap) {
            return <div className="AssetPair__separator" />;
        }

        return <SwitchBtn onClickFunc={() => this.swapPair()} />;
    }

    assetUpdate(asset, assetType) {
        this.setState({ [assetType]: asset });

        const isBase = assetType === 'baseBuying';
        const base = isBase ? asset : this.props.baseBuying;
        const counter = isBase ? this.props.counterSelling : asset;

        this.props.d.orderbook.setOrderbook(base, counter);
        this.props.d.trades.setPair(base, counter);
        window.history.pushState({}, null, `${Stellarify.pairToExchangeUrl(base, counter)}`);
        window.scrollTo(0, 0);
    }

    swapPair() {
        const { baseBuying, counterSelling } = this.props;
        this.props.d.orderbook.setOrderbook(counterSelling, baseBuying);
        this.props.d.trades.setPair(counterSelling, baseBuying);
        window.history.pushState({}, null, `${Stellarify.pairToExchangeUrl(counterSelling, baseBuying)}`);
        window.scrollTo(0, 0);
    }

    showErrorMessage() {
        this.setState({ showError: true });
        setTimeout(() => this.setState({ showError: false }), 5000);
    }

    render() {
        const { row, d, baseBuying, counterSelling, dropdown, swap, fullscreen } = this.props;
        const assetPairClassName = `AssetPair ${fullscreen ? 'AssetPair_fullscreen' : ''}`;

        const content = (
            <div className={assetPairClassName}>
                {this.getAssetCard(dropdown, d, 'baseBuying')}
                {this.getSeparator(swap)}
                {this.getAssetCard(dropdown, d, 'counterSelling')}
            </div>
        );

        if (!row) {
            return content;
        }

        if (!baseBuying || !counterSelling) {
            return <div className="AssetPairRow">{content}</div>;
        }

        if (!_.isEqual(baseBuying, counterSelling)) {
            const url = `/${Stellarify.pairToExchangeUrl(baseBuying, counterSelling)}`;
            // In the future, this can be split into AssetPairRow and AssetPair if the row is not needed
            return (
                <Link to={url} key={url} className="AssetPairRow">
                    {content}
                </Link>
            );
        }

        return (
            <div>
                <a onClick={() => this.showErrorMessage()} className="AssetPairRow">
                    {content}
                </a>
                {this.state.showError && <p className="AssetPair_error">Please select different assets</p>}
            </div>
        );
    }
}

AssetPair.propTypes = {
    d: PropTypes.instanceOf(Driver),
    baseBuying: PropTypes.objectOf(PropTypes.string),
    counterSelling: PropTypes.objectOf(PropTypes.string),
    row: PropTypes.bool,
    swap: PropTypes.bool,
    dropdown: PropTypes.bool,
    fullscreen: PropTypes.bool,
};
