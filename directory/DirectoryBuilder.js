let logos = require('./logos');
// We depend on logos being compiled to a js script so that it can be trivially included
// in the StellarTerm client without webpack

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
    this.pairs = {};

    // Special anchors aren't really anchors at all!
    this.nativeAnchor = {
      name: 'Stellar Network',
      website: 'https://www.stellar.org/lumens/',
      logo: logos['stellar'],
      color: '#08b5e5',
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

  toJson() {
    return JSON.stringify(this, null, 2);
  }

  addAnchor(details) {
    if (this.anchors[details.domain] !== undefined) {
      throw new Error('Duplicate anchor in directory: ' + details.domain);
    }
    if (logos[details.logo] === undefined) {
      throw new Error('Missing logo file: ' + details.logo);
    }
    if (details.website.indexOf('http://') !== -1) {
      throw new Error('Website URL must use https://');
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

    if (details.color) {
      if (!details.color.match(/^#([A-Fa-f0-9]{6})/)) {
        throw new Error('Color must be in hex format with 6 characters (example: #c0ffee). Got: ' + details.color);
      }
      this.anchors[details.domain].color = details.color;
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

  // Must specify by domain
  // You can only add pairs with known issuers. Otherwise, the purpose of the directory is defeated
  addPair(opts) {
    let baseAsset = this.getAssetByDomain(opts.baseBuying[0], opts.baseBuying[1]);
    let counterAsset = this.getAssetByDomain(opts.counterSelling[0], opts.counterSelling[1]);
    if (baseAsset === null) {
      throw new Error('Unknown baseBuying asset when adding pair: ' + opts.baseBuying[0] + '-' + opts.baseBuying[1]);
    }
    if (counterAsset === null) {
      throw new Error('Unknown counterSelling asset when adding pair: ' + opts.counterSelling[0] + '-' + opts.counterSelling[1]);
    }
    let pairId = baseAsset.code + '-' + baseAsset.domain + '/' + counterAsset.code + '-' + counterAsset.domain;
    if (this.pairs.hasOwnProperty(pairId)) {
      throw new Error('Adding duplicate trading pair: ' + pairId);
    }
    if (this.pairs.hasOwnProperty(counterAsset.code + '-' + counterAsset.domain + '/' + baseAsset.code + '-' + baseAsset.domain)) {
      throw new Error('Adding duplicate trading pair (in reverse): ' + pairId);
    }
    this.pairs[pairId] = {
      baseBuying: {
        code: baseAsset.code,
        issuer: baseAsset.issuer,
      },
      counterSelling: {
        code: counterAsset.code,
        issuer: counterAsset.issuer,
      },
    };
  }

  // Always returns something regardless of what is put in
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

  // getAsset() is general and takes in any of the combination:
  // - code:string, issuerAccountId:string
  // - code:string, anchorDomain:string
  // - sdkAsset:StellarSdk.Asset
  // All functions that are getAssset*() will return null if the asset is not found
  getAsset(codeOrSdkAsset, domainOrAccountId) {
    if (codeOrSdkAsset instanceof StellarSdk.Asset) {
      return this.getAssetBySdkAsset(codeOrSdkAsset);
    }

    if (StellarSdk.StrKey.isValidEd25519PublicKey(domainOrAccountId) ||
       domainOrAccountId === null) {
      return this.getAssetByAccountId(codeOrSdkAsset, domainOrAccountId);
    }
    return this.getAssetByDomain(codeOrSdkAsset, domainOrAccountId);
  }

  // Returns null if asset is not found
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

  // Returns unknown if asset is not found
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

  // Finds an asset by the accountId but if it fails, we will still return
  // an asset but with an empty domain
  resolveAssetByAccountId(code, issuer) {
    let asset = this.getAssetByAccountId(code, issuer);
    if (asset) {
      return asset;
    }

    return {
      code,
      issuer,
      domain: 'unknown',
    }
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

module.exports = DirectoryBuilder;
