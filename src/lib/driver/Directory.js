import req from '../api/req';
import * as EnvConsts from '../../env-consts';

const MEMO_TYPES = new Set(['MEMO_TEXT', 'MEMO_ID', 'MEMO_HASH', 'MEMO_RETURN']);
const DATA_URL = EnvConsts.ANCHORS_URL.startsWith('/') ? `${window.location.origin}${EnvConsts.ANCHORS_URL}` : EnvConsts.ANCHORS_URL;

class DirectoryClass {
    constructor() {
        this.anchors = {};
        this.destinations = {};
        this.assets = {};
        this.issuers = {};
        this.pairs = {};
        this.initializationRequest = null;
        this.buildID = '';

        // Special anchors aren't really anchors at all!
        this.nativeAnchor = {
            name: 'Stellar Network',
            website: 'https://www.stellar.org/lumens/',
            logo: '/anchors/logos/stellar.png',
            color: '#000000',
        };
        this.nativeAsset = {
            code: 'XLM',
            issuer: null,
            domain: 'native',
        };

        this.unknownAnchor = {
            name: 'unknown',
            logo: '/anchors/logos/unknown.png',
            assets: {},
        };
    }

    initialize() {
        if (!this.initializationRequest) {
            this.initializationRequest = req.getJson(DATA_URL).then(data => {
                data.anchors.forEach(anchor => this.addAnchor(anchor));
                data.destinations.forEach(destination => this.addDestination(destination));
                this.buildID = data.buildId;
            });
        }
        return this.initializationRequest;
    }

    addAnchor(anchor) {
        if (!this.validateAnchor(anchor)) {
            console.warn(`Anchor ${anchor.domain} is invalid, it will be skipped`);
            return;
        }
        // add anchor
        this.anchors[anchor.domain] = {
            name: anchor.domain,
            displayName: anchor.displayName,
            support: anchor.support,
            website: anchor.website,
            logo: anchor.logo,
            assets: {},
        };
        if (anchor.color) {
            this.anchors[anchor.domain].color = anchor.color;
        }

        // add assets
        anchor.assets.forEach(asset => {
            const slug = `${asset.code}-${asset.issuer}`;
            this.assets[slug] = Object.assign({}, asset, { domain: anchor.domain });
            this.anchors[anchor.domain].assets[asset.code] = slug;
            if (!this.issuers[asset.issuer]) {
                this.issuers[asset.issuer] = {};
            }
            this.issuers[asset.issuer][asset.code] = slug;

            // add pair for asset
            const isCounterAsset = asset.code === 'BTC' || asset.isCounterSelling;
            const assetData = {
                domain: anchor.domain,
                code: asset.code,
                issuer: asset.issuer,
            };
            const baseAsset = isCounterAsset ? this.nativeAsset : assetData;
            const counterAsset = isCounterAsset ? assetData : this.nativeAsset;
            const pairId = `${baseAsset.code}-${baseAsset.domain}/${counterAsset.code}-${counterAsset.domain}`;

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
        });
    }

    validateAnchor(anchor) {
        let isValid = true;
        if (!anchor.domain) {
            console.error('Missing anchor domain');
            isValid = false;
        }
        if (this.anchors[anchor.domain] !== undefined) {
            console.error(`Duplicate anchor in directory: ${anchor.domain}`);
            isValid = false;
        }
        if (!anchor.logo === undefined) {
            console.error(`Missing logo file: ${anchor.logo}`);
            isValid = false;
        }
        if (anchor.website.indexOf('http://') !== -1) {
            console.error('Website URL must use https://');
            isValid = false;
        }
        if (anchor.website.indexOf(anchor.domain) === -1) {
            console.error('Website URL of anchor must contain the anchor domain');
            isValid = false;
        }
        if (!anchor.displayName) {
            console.error(`Display name is required for anchor: ${anchor.domain}`);
            isValid = false;
        }
        if (anchor.color && !anchor.color.match(/^#([A-Fa-f0-9]{6})/)) {
            console.error(`Color must be in hex format with 6 characters (example: #c0ffee). Got: ${anchor.color}`);
            isValid = false;
        }
        const assets = anchor.assets.map(({ code }) => code);
        if (assets.length !== new Set(assets).size) {
            console.error('All anchors assets codes must be unique');
            isValid = false;
        }
        anchor.assets.forEach((asset) => {
            if (!Object.prototype.hasOwnProperty.call(asset, 'code') || !Object.prototype.hasOwnProperty.call(asset, 'issuer')) {
                console.error('Missing assets issuer or code');
                isValid = false;
            }
            const slug = `${asset.code}-${asset.issuer}`;
            if (Object.prototype.hasOwnProperty.call(this.assets, slug)) {
                console.error(`Duplicate asset: ${slug}`);
                isValid = false;
            }
            if (Object.prototype.hasOwnProperty.call(asset, 'unlisted') && asset.unlisted !== true) {
                console.error(`Asset property unlisted must be unset or true: ${slug}`);
                isValid = false;
            }
        });
        return isValid;
    }

    addDestination(destination) {
        const { id, data } = destination;
        if (!data.name) {
            throw new Error('Name required for destinations');
        }
        if (data.requiredMemoType && !MEMO_TYPES.has(data.requiredMemoType)) {
            throw new Error('Invalid memo type when adding destination');
        }
        this.destinations[id] = Object.assign({}, data);
    }

    getAnchor(domain) {
        if (domain === 'native') {
            return this.nativeAnchor;
        }
        return this.anchors[domain] || this.unknownAnchor;
    }

    getAssetByDomain(code, domain) {
        if (code === 'XLM' && domain === 'native') {
            return this.nativeAsset;
        }
        const slug = this.anchors[domain] && this.anchors[domain].assets[code];
        return slug ? {
            code,
            issuer: this.assets[slug].issuer,
            domain,
        } : null;
    }

    getAssetByAccountId(code, issuer) {
        if (code === 'XLM' && issuer === null) {
            return this.nativeAsset;
        }
        return this.assets[`${code}-${issuer}`] || null;
    }

    resolveAssetByAccountId(code, issuer) {
        return this.getAssetByAccountId(code, issuer) || {
            code,
            issuer,
            domain: 'unknown',
        };
    }

    getAssetBySdkAsset(asset) {
        return asset.isNative() ? this.nativeAsset : this.getAssetByAccountId(asset.getCode(), asset.getIssuer());
    }

    getDestination(accountId) {
        return this.destinations[accountId];
    }
}

export default new DirectoryClass();
