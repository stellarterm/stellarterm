import _ from 'lodash';
import directory from '../directory';

const Stellarify = {
  // orderbookDetails(input) {
    // Obsolete
  //   const stellarified = input;
  //   stellarified.base = this.asset(input.base);
  //   stellarified.counter = this.asset(input.counter);
  //   return stellarified;
  // },
  asset(input) {
    if (input.asset_type === 'native') {
      return new StellarSdk.Asset.native();
    }
    return new StellarSdk.Asset(input.asset_code, input.asset_issuer);
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
      console.log();
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
};

export default Stellarify;
