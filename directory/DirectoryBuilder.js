let logos = require('./logos');
// We depend on logos being compiled to a js script so that it can be trivially included
// in the StellarTerm client without webpack

// Constraints: Data should be easily serializable into JSON (no references to each other)
// directory.js should not depend on creating objects with StellarSdk (though its methods should support reading them)

// Note: the DirectoryBuilder concept of slug is slightly different from that of Stellarify
// slugs here can only have the format `code-accountId`

function DirectoryBuilder() {
  // There is a reason why prototypical "classes" are used here instead of ES6
  // classes. The reason is that some build processes such as create-react-app
  // expect modules to work in ES5 without transpilation. Instead of adding
  // another complexity in the directory build process, we just use good ol
  // JavaScript prototypical "classes" here.

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

DirectoryBuilder.prototype.toJson = function() {
  return JSON.stringify(this, null, 2);
}

DirectoryBuilder.prototype.addAnchor = function(details) {
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
  if (!details.displayName) {
    throw new Error('Display name is required for anchor: ' + details.domain);
  }

  this.anchors[details.domain] = {
    name: details.domain,
    displayName: details.displayName,
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

const POSSIBLE_ASSET_TYPES = {
  'token': true, // Token means that the coin on Stellar is the coin itself
  'iou': true, // IOU means that the issuer supposedly claims the tokens are backed by something outside of Stellar
};

DirectoryBuilder.prototype.addAsset = function(anchorDomain, details) {
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
  if (details.instructions) {
    this.assets[slug]['instructions'] = details.instructions;
  }
  if (details.unlisted) {
    if (details.unlisted !== true) {
      throw new Error('Asset property unlisted must be unset or true: ' + slug);
    }
    this.assets[slug]['unlisted'] = true;
  }
  if (details.type) {
    if (details.type in POSSIBLE_ASSET_TYPES) {
      this.assets[slug].type = details.type;
    } else {
      throw new Error('Invalid asset type "' + details.type + '" for token: ' + slug);
    }
  }

  this.anchors[anchorDomain].assets[details.code] = slug;
  this.issuers[details.issuer][details.code] = slug;
}

DirectoryBuilder.prototype.addDestination = function(accountId, opts) {
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

  this.destinations[accountId].mergeOpAccepted = false;
  if (opts.mergeOpAccepted !== undefined) {
    if (opts.mergeOpAccepted === true) {
      this.destinations[accountId].mergeOpAccepted = true;
    } else if (opts.mergeOpAccepted !== false) {
      throw new Error('Destination opts.mergeOpAccepted must either be true or false');
    }
  }

  this.destinations[accountId].pathPaymentAccepted = false;
  if (opts.pathPaymentAccepted !== undefined) {
    if (opts.pathPaymentAccepted === true) {
      this.destinations[accountId].pathPaymentAccepted = true;
    } else if (opts.pathPaymentAccepted !== false) {
      throw new Error('Destination opts.pathPaymentAccepted must either be true or false');
    }
  }

  if (Array.isArray(opts.acceptedAssetsWhitelist)) {
    this.destinations[accountId].acceptedAssetsWhitelist = [];
    opts.acceptedAssetsWhitelist.forEach(assetSlug => {
      if (typeof assetSlug !== 'string') {
        throw new Error('Destination opts.acceptedAssetsWhitelist must be string. Got: ' + assetSlug);
      } else if (assetSlug.indexOf('-') < 1) {
        throw new Error('Destination opts.acceptedAssetsWhitelist must be in slug format like XLM-native or BTC-GA7B. Got: ' + assetSlug);
      }

      this.destinations[accountId].acceptedAssetsWhitelist.push(assetSlug);
    });
  }
}

// Must specify by domain
// You can only add pairs with known issuers. Otherwise, the purpose of the directory is defeated
DirectoryBuilder.prototype.addPair = function(opts) {
  if (!opts.baseBuying || !opts.counterSelling) {
    throw new Error('Both baseBuying and counterSelling are required when adding pair. (You probably have a duplicate?)');
  }
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
DirectoryBuilder.prototype.getAnchor = function(domain) {
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

// DEPRECATED so that we won't have a external dependency of StellarSdk
// getAsset() is general and takes in any of the combination:
// - code:string, issuerAccountId:string
// - code:string, anchorDomain:string
// - sdkAsset:StellarSdk.Asset
// All functions that are getAssset*() will return null if the asset is not found
// getAsset(codeOrSdkAsset, domainOrAccountId) {
//   if (codeOrSdkAsset instanceof StellarSdk.Asset) {
//     return this.getAssetBySdkAsset(codeOrSdkAsset);
//   }

//   if (StellarSdk.StrKey.isValidEd25519PublicKey(domainOrAccountId) ||
//      domainOrAccountId === null) {
//     return this.getAssetByAccountId(codeOrSdkAsset, domainOrAccountId);
//   }
//   return this.getAssetByDomain(codeOrSdkAsset, domainOrAccountId);
// }

// Returns null if asset is not found
DirectoryBuilder.prototype.getAssetByDomain = function(code, domain) {
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
DirectoryBuilder.prototype.getAssetByAccountId = function(code, issuer) {
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
DirectoryBuilder.prototype.resolveAssetByAccountId = function(code, issuer) {
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

DirectoryBuilder.prototype.getAssetBySdkAsset = function(asset) {
  if (asset.isNative()) {
    return this.nativeAsset;
  }
  return this.getAssetByAccountId(asset.getCode(), asset.getIssuer());
}

DirectoryBuilder.prototype.getDestination = function(accountId) {
  return this.destinations[accountId];
}

// getAssetsByIssuer() {
//   // To be implemented when there is actually a use case
// }

// getAnchorByAsset() {
//   // To be implemented when there is actually a use case
// }

module.exports = DirectoryBuilder;
