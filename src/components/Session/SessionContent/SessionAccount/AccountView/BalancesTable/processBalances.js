import * as StellarSdk from 'stellar-sdk';
import MagicSpoon from '../../../../../../lib/helpers/MagicSpoon';

const getUnknownAssetData = async ({ code, issuer, balance }, d) => {
    const lastTrades = await MagicSpoon.getLast24hAggregationsWithStep15min(d.Server,
        new StellarSdk.Asset(code, issuer), StellarSdk.Asset.native());

    const lastTrade = await MagicSpoon.getLastMinuteAggregation(d.Server, new StellarSdk.Asset(code, issuer),
        StellarSdk.Asset.native());

    if (!lastTrades || !lastTrade || !lastTrades.records.length) {
        return null;
    }

    const startPeriodIndex = lastTrades.records.length - 1;
    const startPrice = parseFloat(lastTrades.records[startPeriodIndex].open);
    const finishPrice = parseFloat(lastTrade.records[0].close);

    const { USD_XLM } = d.ticker.data._meta.externalPrices;

    const change24hUSD = (((finishPrice / startPrice) - 1) * 100);

    const balanceUSD = (parseFloat(balance) * lastTrades.records[0].avg * USD_XLM);

    return {
        change24hUSD,
        balanceUSD,
    };
};

const processBalances = d => {
    const account = d.session.account;

    return Promise.all(account
        .getSortedBalances()
        .map(async balance => {
            const tickerAsset = d.ticker.data.assets.find(({ code, issuer }) =>
                code === balance.code && issuer === balance.issuer,
            );

            if (tickerAsset) {
                const balanceUSD = (balance.balance * (tickerAsset.price_USD || 0));

                Object.assign(balance, {
                    tradeLink: tickerAsset.slug !== 'XLM-native' ? `/exchange/${tickerAsset.topTradePairSlug}` : '',
                    balanceUSD,
                    change24h_USD: tickerAsset.change24h_USD,
                    id: tickerAsset.id,
                });
            } else {
                const { balanceUSD, change24hUSD } = await getUnknownAssetData(balance, d) || {};
                const tradeLink = `/exchange/${balance.code}-${balance.issuer}/XLM-native`;
                Object.assign(balance, { tradeLink, balanceUSD, change24h_USD: change24hUSD });
            }
            return balance;
        }));
};

export default processBalances;
