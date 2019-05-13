# StellarTerm Directory
StellarTerm maintains a manually updated directory file with a listing of some assets on the Stellar network. StellarTerm currently does not fetch stellar.toml files to discover assets as a way to prevent phishing.

The creators of this file does not endorse any of this information contained in the directory. There may be mistakes in this directory (and historically there have been).


## How to get listed
Anchors and assets if they fulfill the requirements below (guidelines are not perfect; StellarTerm does not endorse any of these assets).

Please gather the *9 things needed* first. To list your directory, please create a GitHub issue. To expedite inclusion into the directory, please open a pull request with changes implemented.

Inclusion into the StellarTerm directory is not guaranteed.

## First, show that you have 9 things needed:
### 1. 100+ points on Reddit [r/Stellar](https://www.reddit.com/r/Stellar/) or Project tweeted by [@StellarOrg](https://twitter.com/StellarOrg)

To qualify via [Reddit](https://www.reddit.com/r/Stellar/) post, a post on [r/Stellar](https://www.reddit.com/r/Stellar/) about the project must have more than 50 points. Vote manipulation is not allowed. In the event a r/Stellar moderator tries to delete your post, StellarTerm developers are unable to help with this Reddit issue. Example of a post that qualifies: [https://www.reddit.com/r/Stellar/comments/7ym7vg/new_project_on_stellar_micropayments_for/](https://www.reddit.com/r/Stellar/comments/7ym7vg/new_project_on_stellar_micropayments_for/)

To qualify via tweet, it must have been tweeted or retweeted [Stellar Development Foundation](https://www.stellar.org/)'s twitter account @StellarOrg. Here is an example of a tweet that qualifies: https://twitter.com/StellarOrg/status/941284847695343616

Alternatively, be listeded on SDF's partner directory at [https://www.stellar.org/about/directory](https://www.stellar.org/about/directory) also qualifies.

### 2. Asset explanation
Explain on the website what the asset is for and what does it do.

### 3. Team and about the developers
Display on your website who are the team members and who is running the project. Authors of the asset must be known.

### 4. Website SSL
For security, your website must:
- Have working SSL https://
- http:// must redirect to https://
- Must say `Secure connection` when using Chrome. (No linking to insecure resources)

### 5. Stellar.toml hosted on your site
Must have a stellar.toml correctly hosted. Information on how to do this is here: https://www.stellar.org/developers/guides/concepts/stellar-toml.html

### 6. CORS must be configured correctly. The ["Accept asset via anchor domain" tool](https://stellarterm.com/#account/addTrust) should work with your domain.
CORS enables web clients to fetch the stellar.toml file. To test this out, go to https://stellarterm.com/#account/addTrust and use the `Accept asset via anchor domain` tool. If CORS is configured properly, your stellar.toml should work. You can use the [web developer console](https://developers.google.com/web/tools/chrome-devtools/) to see console output for debugging.

Instructions are available in [the Stellar Developer docs](https://www.stellar.org/developers/guides/concepts/stellar-toml.html#enabling-cross-origin-resource-sharing-cors).

### 7. Square logo that meets guidelines
Logo should be in the format as below. Alternatively, you may create a GitHub issue with a high resolution logo and the developers of StellarTerm will adjust it (the process will be slower).

Please use pngquant (https://pngquant.org/) to optimize the logo.

### 8. Brand color in #RRGGBB
This color is used in the StellarToml asset "cards" for the border. The background of the asset "cards" are lightened.

### 9. Homedomain correctly set in your Stellar asset
Homedomain is necessary for your domain name to show up in other interfaces to the Stellar Decentralized Exchange.

Please read more in the Stellar developer docs: https://www.stellar.org/developers/guides/concepts/accounts.html#home-domain

## Second: Create a pull request
1. Fork the repo to your own account
2. Add an anchor+asset in the directory.js
3. Add a trading pair in the correct section
4. While inside the `directory` folder, run `./checkBuild.sh`
5. Check in all the files. Commit with meaningful message
6. Push to GitHub and create a PR.
7. In your pull request, please show that all the requirements have been met. You can use this template:

```
1. URL: https://link.to.reddit.or.twitter
2.
3.
4.
5. URL: https://your.domain/.well-known/stellar.toml
6.
7.
8.
```

------------------------

## Directory logos
StellarTerm displays logos of Stellar anchors to make it easier for end users to recognize them and protect themselves against phishing attacks. When a unknown issuer of invalid asset pair is used, an image indicating that the asset is unknown will be shown.

### Directory logo guidelines
To provide a cleaner user interface, StellarTerm directory logos follow the following guidelines:
- 100x100px
- png format; optimized using default settings of pngquant
- 10px of space from each edge (leaving 80px for content) of space from each edge to give space to the logo. The graphic can extend up to 5% from the edge for flourishes and can extend all the way to the edge if that is how the logo is designed
- Background color should either be relevant to the logo (such as if it's square) or *transparency* should be used
- Only one logo per domain name. Currently, StellarTerm does not support custom icons per currency


## Files
`directory.json` and `logos.json` are automatically generated by the scripts `buildDirectory.js` and `buildLogos.js`.

`checkBuild.js` ensures that the `directory.js` and `logos/` end up building the json files that are checked into the git repository. In other words, `checkBuild.js` is used to keep the source and built files in sync.

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

directory.toJson(); // Should be the same output as directory.json
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
This step is arguably safer as you can verify the data yourself. Simply download the `directory.json` file from the [StellarTerm GitHub repo](https://github.com/stellarterm/stellarterm/tree/master/directory/) and paste it into your application. Repeat again when updates are desired.
