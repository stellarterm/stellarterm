import React from 'react';
import PropTypes from 'prop-types';
import AssetCard2 from './AssetCard2';
import Printify from '../lib/Printify';
import directory from '../directory';
import Format from '../lib/Format';
import Ticker from '../lib/api/Ticker';

export default class AssetListRows extends React.Component {
    static getPriceXLM(isXLMNative, asset) {
        if (isXLMNative) {
            return Printify.lightenZeros('1.0000000');
        }

        return asset.price_XLM
            ? Printify.lightenZeros(asset.price_XLM.toString(), Format.niceNumDecimals(asset.price_XLM))
            : '-';
    }

    getAssetDataRows(isXLMNative, asset) {
        const priceUSD = asset.price_USD ? (
            <span>${Printify.lightenZeros(asset.price_USD.toString(), Format.niceNumDecimals(asset.price_USD))}</span>
        ) : '-';

        const volume24h = asset.volume24h_USD
            ? `$${asset.volume24h_USD.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            })}` : '$0';

        const priceXLM = AssetListRows.getPriceXLM(isXLMNative, asset);
        const change24h = this.checkFor24hChanges(isXLMNative, asset);
        const tradeLink = asset.topTradePairSlug ?
            (<span className="AssetList__asset__amount__trade">trade</span>) :
            null;

        const assetListClass = 'AssetList__asset__amount';

        return (
            <React.Fragment>
                <div className={assetListClass}>
                    {priceXLM}
                    {Printify.lighten(' XLM')}
                </div>
                <div className={assetListClass}>{priceUSD}</div>
                <div className={assetListClass}>{volume24h}</div>
                <div className={assetListClass}>{change24h}</div>
                <div className={assetListClass}>{tradeLink}</div>
            </React.Fragment>
        );
    }

    checkFor24hChanges(isXLMNative, asset) {
        let change24hPercentage;
        const { ticker } = this.props;

        if (isXLMNative) {
            change24hPercentage = ticker.data._meta.externalPrices.USD_XLM_change;
        } else {
            change24hPercentage = asset.change24h_USD;
        }

        if (change24hPercentage === null || change24hPercentage === undefined) {
            return '-';
        } else if (change24hPercentage < 0) {
            return <span className="AssetList__asset__changeNegative">{change24hPercentage.toFixed(2)}%</span>;
        }
        return <span className="AssetList__asset__changePositive">{change24hPercentage.toFixed(2)}%</span>;
    }

    render() {
        const { ticker, limit } = this.props;

        return ticker.data.assets.map((asset, index) => {
            const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);
            const limitIsReached = limit && index >= limit;
            const assetIsUndefined = directoryAsset === null || directoryAsset.unlisted;

            if (limitIsReached || assetIsUndefined) { return null; }

            const isXLMNative = asset.id === 'XLM-native';
            const assetRow = this.getAssetDataRows(isXLMNative, asset);

            return (
                <a href={`#exchange/${asset.topTradePairSlug}`} key={`asset-${asset.id}`} className="AssetList__asset">
                    <div className="AssetList__asset__assetCard">
                        <AssetCard2 code={asset.code} issuer={asset.issuer} boxy={false} />
                    </div>
                    {assetRow}
                </a>
            );
        });
    }
}

AssetListRows.propTypes = {
    ticker: PropTypes.instanceOf(Ticker).isRequired,
    limit: PropTypes.number,
};
