import React from 'react';
import PropTypes from 'prop-types';
import Stellarify from '../lib/Stellarify';
import AssetDropDown from './AssetDropDown';
import AssetCard2 from './AssetCard2';
import Driver from '../lib/Driver';

const images = require('./../images');


export default class AssetPair extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            baseBuying: this.props.baseBuying,
            counterSelling: this.props.counterSelling,
        };
    }

    getAssetCard(dropdown, d, assetType) {
        if (!this.props[assetType]) {
            return null;
        }

        const isBase = (assetType === 'baseBuying');
        const exception = isBase ? this.props.counterSelling : this.props.baseBuying;

        return (
            <div className="AssetPair__card">
                {dropdown ?
                    (<AssetDropDown
                        onUpdate={(asset) => { this.assetUpdate(asset, assetType); }}
                        d={d}
                        asset={this.state[assetType]}
                        clear={() => this.clearAsset(assetType)}
                        exception={exception}
                        isBase={isBase} />) :

                    (<AssetCard2 code={this.props[assetType].getCode()} issuer={this.props[assetType].getIssuer()} />)}
            </div>
        );
    }

    getSeparator(swap) {
        if (!swap) {
            return <div className="AssetPair__separator" />;
        }
        return (
            <div className="AssetPair__swap" onClick={() => this.swap()}>
                <img src={images.switch} alt="swap" width="20" height="24" />
            </div>
        );
    }

    assetUpdate(asset, assetType) {
        this.setState({ [assetType]: asset });

        const isBase = assetType === 'baseBuying';
        const base = isBase ? asset : this.props.baseBuying;
        const counter = isBase ? this.props.counterSelling : asset;

        window.location = `#${Stellarify.pairToExchangeUrl(base, counter)}`;
    }

    clearAsset(assetType) {
        this.setState({ [assetType]: null });
    }

    swap() {
        window.location = `#${Stellarify.pairToExchangeUrl(this.props.counterSelling, this.props.baseBuying)}`;
    }

    render() {
        const { row, d, baseBuying, counterSelling, dropdown, swap } = this.props;

        const content = (
            <div className="AssetPair">
                {this.getAssetCard(dropdown, d, 'baseBuying')}
                {this.getSeparator(swap)}
                {this.getAssetCard(dropdown, d, 'counterSelling')}
            </div>
        );

        if (!row) {
            return content;
        }

        if (baseBuying && counterSelling) {
            const url = `#${Stellarify.pairToExchangeUrl(baseBuying, counterSelling)}`;
            // In the future, this can be split into AssetPairRow and AssetPair if the row is not needed
            return (
               <a href={url} key={url} className="AssetPairRow">{content}</a>
            );
        }
        return (
            <div className="AssetPairRow">{content}</div>
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
};
