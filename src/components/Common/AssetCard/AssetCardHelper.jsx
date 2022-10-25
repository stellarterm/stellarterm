import React from 'react';
import PropTypes from 'prop-types';
import directory from 'stellarterm-directory';
import Driver from '../../../lib/Driver';
import { CACHED_ASSETS_ALIAS, getAssetString } from '../../../lib/driver/Session';


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
            assetDataChecked: false,
        };
    }

    componentDidMount() {
        this._mounted = true;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.code !== this.props.code || prevProps.issuer !== this.props.issuer) {
            this.setAssetUnchecked();
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    setAssetUnchecked() {
        this.setState({ assetDataChecked: false });
    }

    getRenderedAssetData() {
        if (!this.props.code) {
            throw new Error(`AssetCard expects to get a code in the this.props. Instead, got: ${this.props.code}`);
        }

        const isXLMNative = this.props.code === 'XLM' && this.props.domain === undefined
            && (this.props.issuer === undefined || this.props.issuer === null);
        const haveDomain = this.props.domain !== undefined;
        const haveIssuer = this.props.issuer !== undefined;

        let asset = {};
        if (isXLMNative) {
            asset = directory.nativeAsset;
            const anchor = directory.getAnchor(asset.domain);
            return ({
                asset,
                logo: anchor.logo,
                logoPadding: true,
                domain: anchor.name,
                color: anchor.color,
            });
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

        const cachedAssets = new Map(JSON.parse(localStorage.getItem(CACHED_ASSETS_ALIAS) || '[]'));

        const assetInfo = cachedAssets.get(getAssetString(asset));

        if (!assetInfo && !this.state.assetDataChecked) {
            this.props.d.session.getAssetsData(getAssetString(asset)).then(() => {
                this.forceUpdate();
            }).catch(() => {
                this.setState({ assetDataChecked: true });
            });
        }

        if (!assetInfo && !this.state.assetDataChecked) {
            return ({
                asset,
                logo: 'load',
                logoPadding: true,
                domain: 'load',
                color: '#A5A0A7',
            });
        }

        if (!assetInfo && this.state.assetDataChecked) {
            return ({
                asset,
                logo: 'unknown',
                logoPadding: true,
                domain: 'unknown',
                color: '#A5A0A7',
            });
        }

        // if the average color of the icon is white then for a better view we make the border color black
        if (assetInfo.color === '#ffffff') {
            assetInfo.color = '#000000';
        }

        const anchor = directory.getAnchor(asset.domain);

        return ({
            asset,
            logo: (assetInfo.image || (anchor.name !== 'unknown' && anchor.logo) || 'unknown'),
            logoPadding: true,
            domain: (assetInfo.home_domain || asset.domain || 'unknown'),
            color: assetInfo.color || (anchor.name !== 'unknown' && anchor.color) || '#A5A0A7',
        });
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
};
