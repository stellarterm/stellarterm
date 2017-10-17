## StellarTerm Directory
StellarTerm maintains a manually curated directory file with a listing of well known anchors and assets on the Stellar network. StellarTerm currently does not fetch stellar.toml files to discover assets as a way to prevent phishing. The creators of this file does not endorse any of this information contained in the directory. There may be mistakes in this directory (and historically there have been).

To list your directory, please create a GitHub issue. To expedite inclusion into the directory, please open a pull request.

Anchors and assets will only be added to the directory if they seem potentially legitimate. To be added to the StellarTerm directory, an anchor must have a domain name and a stellar.toml file correctly hosted on the domain name.

### Directory logos
StellarTerm displays logos of Stellar anchors to make it easier for end users to recognize them and protect themselves against phishing attacks. When a unknown issuer of invalid asset pair is used, an image indicating that the asset is unknown will be shown.

### Directory logo guidelines
To provide a cleaner user interface, StellarTerm directory logos follow the following guidelines:
- 100x100px
- png format; optimized using default settings of pngquant
- 10% (10px) of space from each edge to give space to the logo. The graphic can extend up to 5% from the edge for flourishes and can extend all the way to the edge if that is how the logo is designed
- Background color should either be relevant to the logo (such as if it's square) or transparency should be used
- Only one logo per domain name. Currently, StellarTerm does not support custom icons per currency
