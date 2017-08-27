// This is a directory that maps issuer account IDs to their issuers
import _ from 'lodash';
import logos from './logos';

// Constraints: Data should be easily serializable into JSON (no references to each other)
// directory.js should not depend on creating objects with StellarSdk (though its methods should support reading them)
class DirectoryBuilder {
  constructor() {
    this.anchors = {};
    this.destinations = {};
    this.assets = {};

    // Special anchors aren't really anchors at all!
    this.specialAnchors = {
      'stellar': {
        name: 'Stellar Network',
        assets: [
          {
            code: 'XLM',
            issuer: null,
          }
        ],
        website: 'https://www.stellar.org/lumens/',
        logo: logos['stellar'],
      },
      'unknown': {
        domain: 'unknown',
        logo: logos['unknown'],
      }
    };
  }

  addAnchor(details) {
    if (this.anchors[details.domain] !== undefined) {
      throw new Error('Duplicate anchor in directory: ' + details.domain);
    }
    if (logos[details.logo] === undefined) {
      throw new Error('Missing logo file: ' + details.logo);
    }
    this.anchors[details.domain] = {
      name: details.domain,
      website: details.domain,
      logo: details.logo,
      asset: {},
    }
  }

  addAsset(anchor, details) {
    if (!this.anchors.hasOwnProperty(anchor)) {
      throw new Error('Attempting to add asset to unknown anchor: ' + anchor);
    }

    let slug = details.code + '-' + details.issuer;

    if (!this.assets.hasOwnProperty(slug)) {
      throw new Error('Duplicate asset: ' + slug);
    }
    if (!this.anchor.hasOwnProperty(details.anchor)) {
      throw new Error('Adding asset to nonexistent anchor: ' + slug);
    }
    if (!this.anchor[details.anchor].assets.hasOwnProperty(details.code)) {
      throw new Error('Adding asset to anchor with existing asset of same code: ' + slug);
    }

    // TODO: better validation for code and issuer
    this.assets[slug] = {
      code: details.code,
      issuer: details.issuer,
    };

    this.anchors[anchorDomain].assets[details.code] = slug; // Reference back to this asset
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


  getSource(domain) {
    if (this.anchors.hasOwnProperty(domain)) {
      return this.anchors[domain];
    }
    return this.specialAnchors.unknown;
  }

  getSourceByAsset() {
    let code, issuer;
    if (arguments[0] instanceof StellarSdk.Asset) {
      code = arguments[0].getCode();
      issuer = arguments[0].getIssuer();
    } else {
      code = arguments[0];
      issuer = arguments[1];
    }

    if (issuer === undefined || issuer === null) {
      return this.specialAnchors.stellar;
    }

    // Will always return a source. If no source is found, it will return the unknown source
    if (!dataByIssuer.hasOwnProperty(accountId)) {
      return specialData.unknown;
    }
    return dataByIssuer[accountId];
  }

  getDestination(accountId) {
    return this.destinations[accountId];
  }

}
