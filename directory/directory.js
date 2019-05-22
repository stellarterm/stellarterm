// This code is licensed under Apache-2.0.
// It is released AS-IS and without warranty.
// This is simply for informational purposes. The creators of this file does
// not endorse any of this information.

const anchors = require('./anchors.json');
const destinations = require('./destinations.json');

const DirectoryBuilder = require('./DirectoryBuilder');

const directory = new DirectoryBuilder();
directory.DirectoryBuilder = DirectoryBuilder;

// For adding anchors and assets to directory use anchors.json,
// add anchor data and array of assets for this anchor.
// For "fiat" assets add field "isCounterSelling": "true"
// Template:
// {
//     "domain": "DOMAINDOTCOM',
//     "website": "https://DOMAINDOTCOM',
//     "logo": "DOMAINDOTCOM',
//     "color": "#rrggbb',
//     "displayName": "Domain dot com',
//     "assets": [
//     {
//         "code": "ASSETCODE_ASSETCODE',
//         "issuer": "Ga_issuer_account_id',
//         "type": "token",
//         "isCounterSelling": "true",
//     }, ...,  {}]
// },

anchors.forEach((anchor) => {
    directory.addAnchor(anchor);
    anchor.assets.forEach((asset) => {
        directory.addAsset(anchor.domain, asset);
        const isCounterAsset = asset.code === 'BTC' || asset.isCounterSelling;
        directory.addPair({
            baseBuying: isCounterAsset ? ['XLM', 'native'] : [asset.code, anchor.domain],
            counterSelling: isCounterAsset ? [asset.code, anchor.domain] : ['XLM', 'native'],
        });
    });
});

destinations.forEach((destination) => {
    const { id, data } = destination;
    directory.addDestination(id, data);
});

// Assert that each asset has a trading pair
const remainingAssets = Object.assign({}, directory.assets);

const pairIds = Object.keys(directory.pairs);
pairIds.forEach((pairId) => {
    const pair = directory.pairs[pairId];
    if (pair.baseBuying.code === 'XLM' && pair.baseBuying.issuer === null) {
        delete remainingAssets[`${pair.counterSelling.code}-${pair.counterSelling.issuer}`];
    } else if (pair.counterSelling.code === 'XLM' && pair.counterSelling.issuer === null) {
        delete remainingAssets[`${pair.baseBuying.code}-${pair.baseBuying.issuer}`];
    }
});

const remainingAssetKeys = Object.keys(remainingAssets);
if (remainingAssetKeys.length) {
    throw new Error(`Missing trading pair. Please use addPair() for asset: ${remainingAssetKeys[0]}`);
}

module.exports = directory;
