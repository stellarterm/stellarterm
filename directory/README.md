# StellarTerm Directory
StellarTerm maintains a manually curated directory file with a listing of well known anchors and assets on the Stellar network. StellarTerm currently does not fetch stellar.toml files to discover assets as a way to prevent phishing. The creators of this file does not endorse any of this information contained in the directory. There may be mistakes in this directory (and historically there have been).

To list your directory, please create a GitHub issue. To expedite inclusion into the directory, please open a pull request.

Anchors and assets will only be added to the directory if they seem potentially legitimate. To be added to the StellarTerm directory, an anchor must have a domain name and a stellar.toml file correctly hosted on the domain name.

## Usage
There are two ways you can use this: as a node.js module or as a simple json file.

### Node.js module
```sh
npm install stellarterm-directory
```

The package follows semver. Patch versions will mean that content has changed but the structure remains the same

**SECURITY NOTE: This could be potentially insecure as an attacker could change the contents either in flight or on the npm repository. A slightly more secure way is to manually get the JSON.**

#### Module usage
```js
const directory = require('stellarterm-directory');

directory.getAnchor(domain);
directory.getAssetByDomain(code, domain);
directory.getAssetByAccountId(code, issuer);
directory.resolveAssetByAccountId(code, issuer);
directory.getAssetBySdkAsset(asset);
directory.getDestination(accountId);
```

#### Starting from a fresh directory
```js
const DirectoryBuilder = require('stellarterm-directory').DirectoryBuilder;

// See DirectoryBuilder.js for usage details
directory.addAnchor(details);
directory.addAsset(anchorDomain, details);
directory.addDestination(accountId, opts);
directory.addPair(opts);
```

### Manually using the JSON
This step is arguably safer as you can verify the data yourself. Simply download the `directory.json` file from the [StellarTerm GitHub repo](https://github.com/irisli/stellarterm/tree/master/directory/) and paste it into your application. Repeat again when updates are desired.

## Directory logos
StellarTerm displays logos of Stellar anchors to make it easier for end users to recognize them and protect themselves against phishing attacks. When a unknown issuer of invalid asset pair is used, an image indicating that the asset is unknown will be shown.

### Directory logo guidelines
To provide a cleaner user interface, StellarTerm directory logos follow the following guidelines:
- 100x100px
- png format; optimized using default settings of pngquant
- 10% (10px) of space from each edge to give space to the logo. The graphic can extend up to 5% from the edge for flourishes and can extend all the way to the edge if that is how the logo is designed
- Background color should either be relevant to the logo (such as if it's square) or transparency should be used
- Only one logo per domain name. Currently, StellarTerm does not support custom icons per currency
