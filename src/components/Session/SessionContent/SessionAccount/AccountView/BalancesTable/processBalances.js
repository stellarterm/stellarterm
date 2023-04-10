import { getAssetString } from '../../../../../../lib/driver/driverInstances/Session';
import { post } from '../../../../../../lib/api/request';
import { TOP_MARKETS_API } from '../../../../../../env-consts';


const API_LIMIT = 200;

const PRICE_CHANGES_LIMIT = 10;

const processUnknownAssets = (assets, priceUsdXlm) => {
    const params = assets.map(asset => getAssetString(asset));

    const body = JSON.stringify({ asset_keys: params });

    const headers = { 'Content-Type': 'application/json' };

    return post(`${TOP_MARKETS_API}assets/native-prices/`, { headers, body })
        .then(({ results }) => assets.map(asset => {
            const assetData = results.find(({ asset_code: assetCode, asset_issuer: assetIssuer }) =>
                asset.code === assetCode && asset.issuer === assetIssuer);

            const tradeLink = `/exchange/${asset.code}-${asset.issuer}/XLM-native`;

            if (!assetData) {
                return Object.assign({}, asset, { tradeLink });
            }

            const priceChanges = Number(assetData.close_native_price) / Number(assetData.avg_native_price);

            if (priceChanges >= PRICE_CHANGES_LIMIT) {
                return Object.assign({}, asset, { tradeLink });
            }

            const change24hUSD = (((assetData.close_native_price / assetData.open_native_price) - 1) * 100);
            const balanceUSD = (parseFloat(asset.balance) * assetData.close_native_price * priceUsdXlm);

            return Object.assign({}, asset, { change24h_USD: change24hUSD, balanceUSD, tradeLink });
        }));
};

const processBalances = d => {
    const account = d.session.account;

    const result = [];
    const unknownAssets = [];

    account.getSortedBalances().forEach(asset => {
        const tickerAsset = d.ticker.data.assets.find(({ code, issuer }) =>
            code === asset.code && issuer === asset.issuer,
        );

        if (tickerAsset) {
            const balanceUSD = (asset.balance * (tickerAsset.price_USD || 0));

            const processedAsset = Object.assign({}, asset, {
                tradeLink: tickerAsset.slug !== 'XLM-native' ? `/exchange/${tickerAsset.topTradePairSlug}` : '',
                balanceUSD,
                change24h_USD: tickerAsset.change24h_USD,
                id: tickerAsset.id,
            });
            result.push(processedAsset);
        } else {
            unknownAssets.push(asset);
        }
    });

    const chunks = unknownAssets.reduce((acc, item, index) => {
        if (index % API_LIMIT === 0) {
            acc.push([item]);
        } else {
            acc[acc.length - 1].push(item);
        }
        return acc;
    }, []);

    const { USD_XLM } = d.ticker.data._meta.externalPrices;

    return Promise.all(chunks.map(chunk => processUnknownAssets(chunk, USD_XLM))).then(res => {
        res.forEach(assets => {
            assets.forEach(asset => result.push(asset));
        });

        const [lumen, ...assets] = result;

        const sortedAssets = assets.sort((a, b) =>
            (parseFloat(b.balanceUSD === undefined ? -1 : b.balanceUSD) -
                parseFloat(a.balanceUSD === undefined ? -1 : a.balanceUSD))
            || parseFloat(b.balance) - parseFloat(a.balance),
        );

        return [lumen, ...sortedAssets];
    });
};

export default processBalances;
