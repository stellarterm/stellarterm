import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Format from '../../../../lib/Format';
import directory from 'stellarterm-directory';
import Printify from '../../../../lib/Printify';
import Ticker from '../../../../lib/api/Ticker';
import AssetCard2 from '../../AssetCard2/AssetCard2';

export default class AssetListRows extends React.Component {
    static getAssetRow(asset, isNativeXlm, ticker) {
        const priceUSD = asset.price_USD
            ? <span>${Printify.lightenZeros(asset.price_USD.toString(), Format.niceNumDecimals(asset.price_USD))}</span>
            : '-';

        const priceXLM = asset.price_XLM
            ? Printify.lightenZeros(asset.price_XLM.toString(), Format.niceNumDecimals(asset.price_XLM))
            : '-';

        const volume24h = asset.volume24h_USD
            ? `$${asset.volume24h_USD.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            })}`
            : '$0';

        const changePercent = isNativeXlm ? ticker.data._meta.externalPrices.USD_XLM_change : asset.change24h_USD;
        const change24h =
            changePercent !== undefined && changePercent !== null ? (
                <span className={`change${changePercent < 0 ? 'Negative' : 'Positive'}`}>
                    {changePercent.toFixed(2)}%
                </span>
            ) : '-';

        const tradeLink = asset.topTradePairSlug ? <span className="tradeLink">trade</span> : null;

        return (
            <React.Fragment>
                <div className="asset_cell">
                    {isNativeXlm ? Printify.lightenZeros('1.0000000') : priceXLM}
                    {Printify.lighten(' XLM')}
                </div>
                <div className="asset_cell">{priceUSD}</div>
                <div className="asset_cell">{volume24h}</div>
                <div className="asset_cell">{change24h}</div>
                <div className="asset_cell">{tradeLink}</div>
            </React.Fragment>
        );
    }

    componentWillMount() {
        const { ticker } = this.props;

        const assets = ticker.data.assets
            .map((asset) => {
                const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);
                const assetIsUndefined = directoryAsset === null || directoryAsset.unlisted;

                const isAssetHidden = assetIsUndefined || asset.id === 'XLM-native';
                return isAssetHidden
                    ? null
                    : {
                        assetName: asset.code,
                        priceXLM: asset.price_XLM,
                        priceUSD: asset.price_USD,
                        volume24h: asset.volume24h_USD,
                        change24h: asset.change24h_USD,
                        assetRow: (
                              <a
                                  href={`#exchange/${asset.topTradePairSlug}`}
                                  key={`asset-${asset.id}-${asset.code}`}
                                  className="AssetList_asset">
                                  <div className="asset_assetCard">
                                      <AssetCard2 code={asset.code} issuer={asset.issuer} />
                                  </div>
                                  {this.constructor.getAssetRow(asset, false, ticker)}
                              </a>
                          ),
                    };
            })
            .filter(asset => asset !== null);

        this.setState({ assets });
    }

    sortAssets(allAssets) {
        const { sortBy, sortType, limit } = this.props;
        const ascDescType = new Map([[true, 'asc'], [false, 'desc']]);
        const isAscSort = sortType !== null ? ascDescType.get(sortType) : '';
        const halfAssets = [];

        const fullInfoAssets = allAssets.filter((asset) => {
            const isFullUndefined = !asset.priceXLM && !asset.priceUSD && !asset.change24h && !asset.volume24h;

            if (asset[sortBy] === undefined || asset[sortBy] === null || isFullUndefined) {
                halfAssets.push(asset);
                return null;
            }
            return asset;
        });

        const sortedAssets = limit
            ? _.orderBy(fullInfoAssets, 'volume24h', 'desc').slice(0, limit - 1)
            : _.orderBy(fullInfoAssets, sortBy, isAscSort);

        return limit ? _.orderBy(sortedAssets, sortBy, isAscSort) : sortedAssets.concat(halfAssets);
    }

    render() {
        const { ticker } = this.props;
        const Xlm = ticker.data.assets.find(asset => asset.id === 'XLM-native');

        return (
            <React.Fragment>
                <a href={`#exchange/${Xlm.topTradePairSlug}`} className="AssetList_asset">
                    <div className="asset_assetCard">
                        <AssetCard2 code={Xlm.code} issuer={Xlm.issuer} />
                    </div>
                    {AssetListRows.getAssetRow(Xlm, true, ticker)}
                </a>

                {this.sortAssets(this.state.assets).map(asset => asset.assetRow)}
            </React.Fragment>
        );
    }
}

AssetListRows.propTypes = {
    ticker: PropTypes.instanceOf(Ticker).isRequired,
    limit: PropTypes.number,
    sortBy: PropTypes.string,
    sortType: PropTypes.bool,
};
