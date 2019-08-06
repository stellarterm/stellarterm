import React from 'react';
import PropTypes from 'prop-types';
import directory from 'stellarterm-directory';
import hexToRGBA from '../../../lib/hexToRgba';
import AssetCardMain from './AssetCardMain/AssetCardMain';
import Driver from '../../../lib/Driver';
import Ellipsis from '../Ellipsis/Ellipsis';
import images from '../../../images';

// This is AssetCard2, the preferred way of displaying an asset in stellarterm.
// The parent container should be 340px or wider

// Options
//  - boxy: removes the rounded borders

// You may also pass in children elements to sit nicely with the AssetCard2.
// The children elements are responsible for padding within the AssetCard

export default class AssetCard2 extends React.Component {
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

    getDataFromLocalStorage(asset, anchor) {
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
        if (!this.props.code) {
            throw new Error(`AssetCard2 expects to get a code in the this.props. Instead, got: ${this.props.code}`);
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
                `AssetCard2 expects to get either domain or issuer. Input code: ${this.props.code} Domain: ${
                    this.props.domain
                    } Issuer: ${this.props.issuer}`,
            );
        }
        if (asset === null) {
            throw new Error(
                'AssetCard2 expects domains or issuer to point to a valid asset/anchor. Please do validation before calling AssetCard2',
            );
        }

        const anchor = directory.getAnchor(asset.domain);
        const issuerAccountId =
            asset.issuer === null
                ? 'native lumens'
                : `${asset.issuer.substr(0, 12)}.........${asset.issuer.substr(-12, 12)}`;

        const assetCardClass = `AssetCard2 AssetCard2--container ${this.props.boxy ? 'AssetCard2--boxy' : ''}`;

        const isUnknown = anchor.name === 'unknown';
        const dataFromLocalStorage = isUnknown && this.getDataFromLocalStorage(asset, anchor);

        let { logo, name, color } = dataFromLocalStorage || anchor;
        let { logoPadding } = dataFromLocalStorage || false;

        if ((name === 'load' || logo === 'load') && this.state.loadedAssetData) {
            name = this.state.loadedAssetData.host || this.props.host || anchor.name;
            const { image, host } = this.state.loadedAssetData.currency || '';
            name = (host && host.split('//')[1]) || name;
            logo = image || 'unknown';
            logoPadding = !!image;
            color = this.state.loadedAssetData.color || color;
        }

        let borderStyle = {};
        const backgroundStyle = {};

        if (color) {
            backgroundStyle.background = hexToRGBA(color, 0.08);
            borderStyle.borderColor = color;
        }

        if (this.props.noborder) {
            borderStyle = { border: 'none' };
        }

        const assetSymbol = asset.code[0]; // Takes first asset symbol, if no any image loaded

        if (this.props.inRow) {
            return (
                <span className="AssetCardInRow">
                    {logo === 'unknown' && logo !== 'load' ? (
                        <div className="AssetCard_unknown_logo unknown_small">
                            <div className="Unknown_circle">
                                <span className="assetSymbol">{assetSymbol}</span>
                            </div>
                        </div>
                    ) : (
                        <img
                            style={Object.assign({}, backgroundStyle, { border: '1px solid' }, borderStyle)}
                            className="Row_logo"
                            src={logo === 'load' ? images['icon-circle-preloader-gif'] : logo}
                            alt={anchor.name} />)}
                     {name === 'load' ?
                         <span>{asset.code} - <Ellipsis /></span> :
                         <span>{`${asset.code}(${name})`}</span>
                    }
                </span>
            );
        }
        return (
            <div className={assetCardClass} style={borderStyle}>
                <AssetCardMain
                    backgroundStyle={backgroundStyle}
                    logo={logo}
                    logoWithPadding={logoPadding}
                    name={name.toLowerCase()}
                    assetCode={asset.code}
                    issuerAccountId={issuerAccountId}
                    assetSymbol={assetSymbol} />

                {this.props.children ? (
                    <div className="AssetCard2__addon" style={Object.assign({}, borderStyle, backgroundStyle)}>
                        {this.props.children}
                    </div>
                ) : null}
            </div>
        );
    }
}

AssetCard2.propTypes = {
    d: PropTypes.instanceOf(Driver),
    code: PropTypes.string.isRequired,
    boxy: PropTypes.bool,
    issuer: PropTypes.string,
    domain: PropTypes.string,
    children: PropTypes.element,
    noborder: PropTypes.bool,
    host: PropTypes.string,
    color: PropTypes.string,
    currency: PropTypes.shape({
        image: PropTypes.string,
        host: PropTypes.string,
    }),
    inRow: PropTypes.bool,
};
