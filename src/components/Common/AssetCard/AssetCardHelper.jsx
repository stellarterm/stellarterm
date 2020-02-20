import React from 'react';
import PropTypes from 'prop-types';
import directory from 'stellarterm-directory';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../lib/Driver';


export default class AssetCardHelper extends React.Component {
    static onImageLoadError(e, directoryLogo, unknownLogoTemplate) {
        if (directoryLogo) {
            e.target.src = directoryLogo;
        } else {
            e.target.replaceWith(unknownLogoTemplate);
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            loadedAssetData: undefined,
        };
    }

    componentDidMount() {
        this._mounted = true;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.code !== this.props.code || prevProps.issuer !== this.props.issuer) {
            this.loadAssetData(new StellarSdk.Asset(this.props.code, this.props.issuer));
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    getUnknownAssetDataFromLocalStorage(asset, anchor) {
        let name = 'load';
        let logo = 'load';
        const unknownAssetsData = JSON.parse(localStorage.getItem('unknownAssetsData')) || [];
        const assetData = unknownAssetsData.find(assetLocalItem => (
            assetLocalItem.code === this.props.code && assetLocalItem.issuer === this.props.issuer
        )) || {};

        if (!assetData.time && !this.state.loadedAssetData && !this.props.currency && !this._mounted) {
            this.loadAssetData(asset);
        }

        const currency = this.props.currency || assetData.currency;
        const { image, host } = currency || '';
        const domain = host && host.split('//')[1];

        name = this.props.host || assetData.host || domain || (assetData.time ? anchor.name : name);
        const color = this.props.color || assetData.color || '#A5A0A7';
        logo = image || (currency ? 'unknown' : logo);
        const logoPadding = !!image;

        return {
            name,
            logo,
            logoPadding,
            color,
        };
    }

    getKnownAssetDataFromLocalStorage(asset, anchor) {
        const knownAssetsData = JSON.parse(localStorage.getItem('knownAssetsData')) || [];
        if (!knownAssetsData.length && !this.props.d.session.addKnownAssetDataCalled) {
            this.props.d.session.addKnownAssetDataPromise.then(() => this.forceUpdate());
            return anchor;
        }
        const knownAsset = knownAssetsData.find(item => (
            item.code === asset.code && item.issuer === asset.issuer
        ));

        if (!knownAsset) {
            return anchor;
        }

        knownAsset.logoPadding = true;
        return knownAsset;
    }

    getRenderedAssetData() {
        if (!this.props.code) {
            throw new Error(`AssetCard expects to get a code in the this.props. Instead, got: ${this.props.code}`);
        }

        const isXLMNative = this.props.code === 'XLM' && this.props.domain === undefined && this.props.issuer === undefined;
        const haveDomain = this.props.domain !== undefined;
        const haveIssuer = this.props.issuer !== undefined;

        let asset = {};
        if (isXLMNative) {
            asset = directory.nativeAsset;
        } else if (haveDomain) {
            asset = directory.getAssetByDomain(this.props.code, this.props.domain);
        } else if (haveIssuer) {
            asset = directory.resolveAssetByAccountId(this.props.code, this.props.issuer);
        } else {
            throw new Error(
                `AssetCard expects to get either domain or issuer. Input code: ${this.props.code} Domain: ${
                    this.props.domain
                } Issuer: ${this.props.issuer}`,
            );
        }
        if (asset === null) {
            throw new Error(
                'AssetCardHelper expects domains or issuer to point to a valid asset/anchor. Please do validation before calling AssetCardHelper',
            );
        }

        const anchor = directory.getAnchor(asset.domain);
        const isUnknown = anchor.name === 'unknown';

        let { name } = isUnknown ? this.getUnknownAssetDataFromLocalStorage(asset, anchor) : anchor;
        let { logo, logoPadding } = isUnknown ?
            this.getUnknownAssetDataFromLocalStorage(asset, anchor) :
            this.getKnownAssetDataFromLocalStorage(asset, anchor);
        let color = isUnknown ? '#A5A0A7' : anchor.color;

        if ((name === 'load' || logo === 'load') && this.state.loadedAssetData) {
            name = this.state.loadedAssetData.host || this.props.host || anchor.name;
            const { image, host } = this.state.loadedAssetData.currency || '';
            name = (host && host.split('//')[1]) || name;
            logo = image || 'unknown';
            logoPadding = !!image;
            color = this.state.loadedAssetData.color || color;
        }
        // if the average color of the icon is white then for a better view we make the border color black
        if (color === '#ffffff') {
            color = '#000000';
        }
        return ({
            asset,
            logo,
            directoryLogo: !isUnknown && anchor.logo,
            logoPadding,
            domain: name,
            color,
        });
    }

    async loadAssetData(asset) {
        if (!this.props.d) {
            return;
        }
        const loadedAssetData = await this.props.d.session.handlers.loadUnknownAssetData(asset);
        if (this._mounted) {
            this.setState({
                loadedAssetData,
            });
        }
    }

    render() {
        return null;
    }
}

AssetCardHelper.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    code: PropTypes.string.isRequired,
    issuer: PropTypes.string,
    domain: PropTypes.string,
    host: PropTypes.string,
    color: PropTypes.string,
    currency: PropTypes.shape({
        image: PropTypes.string,
        host: PropTypes.string,
    }),
};
