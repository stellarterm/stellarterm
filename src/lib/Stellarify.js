import _ from 'lodash';
import directory from '../directory';
import BigNumber from 'bignumber.js';
const Stellarify = {
  // orderbookDetails(input) {
    // Obsolete
  //   const stellarified = input;
  //   stellarified.base = this.asset(input.base);
  //   stellarified.counter = this.asset(input.counter);
  //   return stellarified;
  // },
  asset(input) {
    // Horizon json asset
    if (input.asset_type === 'native') {
      return new StellarSdk.Asset.native();
    }
    return new StellarSdk.Asset(input.asset_code, input.asset_issuer);
  },
  assetToml(input) {
    return new StellarSdk.Asset(input.code, input.issuer);
  },
  memo(type, content) {
    // Type must not be none
    switch(type) {
    case 'MEMO_TEXT':
      return StellarSdk.Memo.text(content);
    case 'MEMO_ID':
      return StellarSdk.Memo.id(content);
    case 'MEMO_HASH':
      return StellarSdk.Memo.hash(content);
    case 'MEMO_RETURN':
      return StellarSdk.Memo.returnHash(content);
    default:
      throw new Error('Unknown Stellarify memo type. Got: ' + type);
    }
  },
  parseAssetSlug(slug) {
    // Takes in a URL part 'XLM-native' or 'USD-stellarterm.com'
    // And converts it into a StellarSdk.Asset object
    // It will throw errors when it doesn't work
    // Will also do directory conversion
    if (!_.isString(slug)) {
      throw new Error('Stellarify.parseAssetSlug slug must be a string');
    }

    let hyphenIndex = slug.indexOf('-');
    if (hyphenIndex < 1) {
      throw new Error('Stellarify.parseAssetSlug expected slug to be split into two with hyphen')
    }

    let code = slug.substr(0, hyphenIndex);
    let issuer = slug.substr(hyphenIndex + 1);

    if (code.length > 12) {
      throw new Error(`Stellarify.parseAssetSlug expected asset code to be 12 or fewer characters. Input: ${code}`)
    }

    if (issuer === 'native') {
      if (code !== 'XLM') {
        console.error(`Native issuers must have XLM code`);
      }
      issuer = null;
    } else if (!StellarSdk.StrKey.isValidEd25519PublicKey(issuer)) {
      // Since it's not a native asset and the issuer wasn't a public key,
      // it could be an asset issued. Lets try to resolve it!
      let asset = directory.getAssetByDomain(code, issuer);
      if (asset !== null) {
        issuer = asset.issuer;
      }
    }

    return new StellarSdk.Asset(code, issuer);
  },
  assetToSlug(asset) {
    let resolvedAsset = directory.getAssetBySdkAsset(asset);
    if (resolvedAsset === null) {
      return `${asset.getCode()}-${asset.getIssuer()}`
    }
    return `${resolvedAsset.code}-${resolvedAsset.domain}`
  },
  pairToExchangeUrl(baseBuying, counterSelling) {
    return `exchange/${this.assetToSlug(baseBuying)}/${this.assetToSlug(counterSelling)}`;
  },
  isOfferRelevant(baseBuying, counterSelling, offer) {
    let offerBuying = this.asset(offer.buying);
    let offerSelling = this.asset(offer.selling);
    return (baseBuying.equals(offerBuying) && counterSelling.equals(offerSelling))
        || (baseBuying.equals(offerSelling) && counterSelling.equals(offerBuying));
  },
  rectifyOffer(baseBuying, counterSelling, offer) {
    let newOffer = _.assign({}, offer);
    // Make sure that the offer is relative to the base/counter pair
    let offerBuying = this.asset(offer.buying);
    let offerSelling = this.asset(offer.selling);
    // / (baseBuying.equals(offerBuying) && counterSelling.equals(offerSelling))
        // || (baseBuying.equals(offerSelling) && counterSelling.equals(offerBuying));
    if (baseBuying.equals(offerBuying) && counterSelling.equals(offerSelling)) {
      // Flip price
      newOffer.side = 'buy';
      newOffer.price_r = {
        d: offer.price_r.n,
        n: offer.price_r.d,
      }
      newOffer.baseAmount = new BigNumber(offer.amount).dividedBy(new BigNumber(newOffer.price_r.n).dividedBy(newOffer.price_r.d)).toFixed(7);
      newOffer.counterAmount = offer.amount;
    } else if (baseBuying.equals(offerSelling) && counterSelling.equals(offerBuying)) {
      // Don't flip
      newOffer.side = 'sell';
      newOffer.baseAmount = offer.amount;
      newOffer.counterAmount = new BigNumber(newOffer.price_r.n).dividedBy(newOffer.price_r.d).times(offer.amount).toFixed(7);
    } else {
      throw new Error('Irrelevant offer passed into rectifyOffer');
      return;
    }
    newOffer.amount = undefined;
    newOffer.price = new BigNumber(newOffer.price_r.n).dividedBy(newOffer.price_r.d).toFixed(7);
    return newOffer;
  },
};

export default Stellarify;
