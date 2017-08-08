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

    let parts = slug.split('-');
    if (parts.length !== 2) {
      throw new Error('Stellarify.parseAssetSlug expected slug to be split into two with hyphen')
    }

    let code = parts[0];
    let issuer = parts[1];
    if (code.length > 12) {
      throw new Error(`Stellarify.parseAssetSlug expected asset code to be 12 or fewer characters. Input: ${code}`)
    }

    if (issuer === 'native') {
      if (code !== 'XLM') {
        throw new Error(`Native issuers must have XLM code`);
      }
      issuer = null;
    } else if (!StellarSdk.Keypair.isValidPublicKey(issuer)) {
      // Neither native nor a public key, so we will try to resolve it
      let source = directory.getSourceByFederation(issuer);
      if (source.name === 'unknown') {
        throw new Error(`Unknown issuer ${issuer}`);
      } else {
        let foundIssuer;
        _.each(source.assets, asset => {
          if (code === asset.code) {
            foundIssuer = asset.issuer;
          }
        });
        if (!foundIssuer) {
          // TODO: Implement default address? I'd say lets just wait and see how issuers set things up
          throw new Error(`Found issuer ${issuer} but could not find asset for issuer`);
        }
        issuer = foundIssuer;
      }
    }

    return new StellarSdk.Asset(code, issuer);
  },
  assetToSlug(asset) {
    if (asset.isNative()) {
      return 'XLM-native';
    }
    let issuer = asset.getIssuer();
    let source = directory.getSourceById(issuer)
    if (source.name !== 'unknown') {
      issuer = source.name;
    }
    return `${asset.getCode()}-${issuer}`
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
