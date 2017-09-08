// This is a directory that maps issuer account IDs to their issuers
import _ from 'lodash';
import logos from './logos';

// Constraints: Data should be easily serializable into JSON (no references to each other)
// directory.js should not depend on creating objects with StellarSdk (though its methods should support reading them)

// Note: the DirectoryBuilder concept of slug is slightly different from that of Stellarify
// slugs here can only have the format `code-accountId`

class DirectoryBuilder {
  constructor() {
    this.anchors = {};
    this.destinations = {};
    this.assets = {};
    this.issuers = {};

    // Special anchors aren't really anchors at all!
    this.nativeAnchor = {
      name: 'Stellar Network',
      website: 'https://www.stellar.org/lumens/',
      logo: logos['stellar'],
    };
    this.nativeAsset = {
      code: 'XLM',
      issuer: null,
      domain: 'native',
    };

    this.unknownAnchor = {
      name: 'unknown',
      logo: logos.unknown,
      assets: {},
    };
  }

  addAnchor(details) {
    if (this.anchors[details.domain] !== undefined) {
      throw new Error('Duplicate anchor in directory: ' + details.domain);
    }
    if (logos[details.logo] === undefined) {
      throw new Error('Missing logo file: ' + details.logo);
    }
    if (details.website.indexOf(details.domain) == -1) {
      throw new Error('Website URL of anchor must contain the anchor domain');
    }
    this.anchors[details.domain] = {
      name: details.domain,
      website: details.website,
      logo: logos[details.logo],
      assets: {},
    }
  }

  addAsset(anchorDomain, details) {
    if (!this.anchors.hasOwnProperty(anchorDomain)) {
      throw new Error('Attempting to add asset to nonexistent anchor: ' + anchorDomain + ' slug: ' + slug);
    }

    let slug = details.code + '-' + details.issuer;

    if (this.assets.hasOwnProperty(slug)) {
      throw new Error('Duplicate asset: ' + slug);
    }
    if (this.anchors[anchorDomain].assets.hasOwnProperty(details.code)) {
      throw new Error('Adding asset to anchor with existing asset of same code: ' + slug);
    }
    if (!this.issuers.hasOwnProperty(details.issuer)) {
      // Issuer doesn't exist
      this.issuers[details.issuer] = {};
    } else if (this.issuers[details.issuer].hasOwnProperty(details.code)) {
      throw new Error('Duplicate asset code for an issuer: ' + slug);
    }

    // TODO: better validation for code and issuer
    this.assets[slug] = {
      code: details.code,
      issuer: details.issuer,
      domain: anchorDomain,
    };

    this.anchors[anchorDomain].assets[details.code] = slug;
    this.issuers[details.issuer][details.code] = slug;
  }

  addDestination(accountId, opts) {
    if (!opts.name) {
      throw new Error('Name required for destinations');
    }
    this.destinations[accountId] = {
      name: opts.name,
    };
    if (opts.requiredMemoType) {
      if (!(opts.requiredMemoType === 'MEMO_TEXT'
         || opts.requiredMemoType === 'MEMO_ID'
         || opts.requiredMemoType === 'MEMO_HASH'
         || opts.requiredMemoType === 'MEMO_RETURN')) {
        throw new Error('Invalid memo type when adding destination');
      }
      this.destinations[accountId].requiredMemoType = opts.requiredMemoType;
    }
  }

  getAnchor(domain) {
    if (!domain) {
      return this.unknownAnchor;
    }
    if (domain === 'native') {
      return this.nativeAnchor;
    }
    if (this.anchors.hasOwnProperty(domain)) {
      return this.anchors[domain];
    }
    return this.unknownAnchor;
  }

  // getAsset() is general and takes in any of the combination
  // - code:string, issuerAccountId:string
  // - code:string, anchorDomain:string
  // - sdkAsset:StellarSdk.Asset
  getAsset(codeOrSdkAsset, domainOrAccountId) {
    if (codeOrSdkAsset instanceof StellarSdk.Asset) {
      return this.getAssetBySdkAsset(codeOrSdkAsset);
    }

    if (StellarSdk.Keypair.isValidPublicKey(domainOrAccountId)) {
      return this.getAssetByAccountId(codeOrSdkAsset, domainOrAccountId);
    }
    return this.getAssetByDomain(codeOrSdkAsset, domainOrAccountId);
  }

  getAssetByDomain(code, domain) {
    if (code === 'XLM' && domain === 'native') {
      return this.nativeAsset;
    }
    if (!this.anchors.hasOwnProperty(domain)) {
      return null;
    }
    if (this.anchors[domain].assets.hasOwnProperty(code)) {
      let slug = this.anchors[domain].assets[code];
      return {
        code: code,
        issuer: this.assets[slug].issuer,
        domain: domain,
      };
    }
  }

  getAssetByAccountId(code, issuer) {
    if (code === 'XLM' && issuer === null) {
      return this.nativeAsset;
    }

    let slug = code + '-' + issuer;
    if (!this.assets.hasOwnProperty(slug)) {
      return null;
    }
    return this.assets[slug];
  }

  getAssetBySdkAsset(asset) {
    if (asset.isNative()) {
      return this.nativeAsset;
    }
    return this.getAssetByAccountId(asset.getCode(), asset.getIssuer());
  }


  // getAssetsByIssuer() {
  //   // To be implemented when there is actually a use case
  // }

  // getAnchorByAsset() {
  //   let code, issuer;
  //   if (arguments[0] instanceof StellarSdk.Asset) {
  //     code = arguments[0].getCode();
  //     issuer = arguments[0].getIssuer();
  //   } else {
  //     code = arguments[0];
  //     issuer = arguments[1];
  //   }

  //   if (issuer === undefined || issuer === null) {
  //     return this.specialAnchors.stellar;
  //   }

  //   // Will always return a source. If no source is found, it will return the unknown source
  //   if (!dataByIssuer.hasOwnProperty(accountId)) {
  //     return specialData.unknown;
  //   }
  //   return dataByIssuer[accountId];
  // }

  // getDestination(accountId) {
  //   return this.destinations[accountId];
  // }
}

export default DirectoryBuilder;
