import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../lib/Driver';
import directory from '../directory';
import AssetCard2 from './AssetCard2';


export default class AssetCardList extends React.Component {
    constructor(props) {
        super(props);
        this.dTicker = props.d.ticker;
        this.listenId = this.dTicker.event.listen(() => { this.forceUpdate(); });
    }

    componentWillUnmount() {
        this.dTicker.event.unlisten(this.listenId);
    }

    handleChoose(asset) {
        this.props.onUpdate(new StellarSdk.Asset(asset.code, asset.issuer));
    }

    render() {
        const { assets } = this.dTicker.data;
        const { code, issuer } = this.props.exception || '';
        const isExceptionNative = this.props.exception && this.props.exception.isNative();

        const rows = assets
            .filter((asset) => {
                const { unlisted } = directory.getAssetByAccountId(asset.code, asset.issuer) || {};
                const isAssetNative = new StellarSdk.Asset(asset.code, asset.issuer).isNative();
                return (
                    !unlisted && ((asset.code !== code) || (asset.issuer !== issuer)) &&
                    !(isExceptionNative && isAssetNative) &&
                    ((asset.code.indexOf(this.props.code.toUpperCase()) > -1) ||
                      (asset.domain.indexOf(this.props.code.toLowerCase()) > -1))
                );
            })
            .map(asset => (
                    <div className="AssetCardList_card" key={asset.id} onClick={() => this.handleChoose(asset)}>
                        <AssetCard2 code={asset.code} issuer={asset.issuer} boxy noborder />
                    </div>
            ));

        return (
            <div className="AssetCardList">
                {rows.length ?
                    rows :
                    <span className="AssetCardList_empty">Asset not found. Use custom pairs selector.</span>
                }
            </div>
        );
    }
}
AssetCardList.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    onUpdate: PropTypes.func,
    code: PropTypes.string,
    exception: PropTypes.objectOf(PropTypes.string),
};
