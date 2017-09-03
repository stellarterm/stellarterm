[![Travis CI status](https://travis-ci.org/irisli/stellarterm.svg?branch=master)](https://travis-ci.org/irisli/stellarterm)

# StellarTerm - Try it out at [stellarterm.com](https://stellarterm.com/)

StellarTerm is a web based trading client for use on the Stellar network. This client aims to make it easy and safe for users of any skill level to trade on the Stellar network by making a clear and secure user interface.

## Screenshots


### A detailed user friendly orderbook
![Orderbook](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/orderbook.png)

### Ability to add trust either from a curated list, manually, or via federation
![Adding trust from directories](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/adding-trust-from-directory.png)

![Adding trust via federation](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/adding-trust-via-federation.png)

### Price history charts
![Price history charts](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/history-chart.png)

### Ability to make offers in an intuitive manner
![Offer maker](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/offermaker.png)

### A directory of the asset pairs traded on the Stellar network
![Market directory](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/marketdirectory.png)

### Manage offers for an account
![Manage offers](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/manage-offers.png)

### Shows listing of balances with secure asset cards
![Detailed balances](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/detailed-balances.png)

### Compatible with accounts from any other client
![Universal login](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/universal-login.png)

## Directory
StellarTerm maintains a directory page with a listing of well known assets on the Stellar network. StellarTerm currently does not fetch stellar.toml files to discover assets as a way to prevent phishing. While StellarTerm tries to be accurate, it does not endorse any issuers and can not guarantee the accuracy of the directory.

To list your directory, please create a GitHub issue or email Iris Li at *stlisting@iris.li*.

Anchors and assets will only be added to the directory if they seem legitimate. To be added to the StellarTerm directory, an anchor must have a domain name and a stellar.toml file correctly hosted on the domain name.

### Directory logos
StellarTerm displays logos of Stellar anchors to make it easier for end users to recognize them and protect themselves against phishing attacks. When a unknown issuer of invalid asset pair is used, an image indicating that the asset is unknown will be shown.

### Directory logo guidelines
To provide a cleaner user interface, StellarTerm directory logos follow the following guidelines:
- 100x100px
- png format; optimized using default settings of pngquant
- 10% (10px) of space from each edge to give space to the logo. The graphic can extend up to 5% from the edge for flourishes and can extend all the way to the edge if that is how the logo is designed
- Background color should either be relevant to the logo (such as if it's square) or transparency should be used
- Only one logo per domain name. Currently, StellarTerm does not support custom icons per currency

## Under the cover features
- No external dependencies or trackers
- All GitHub commits [securely signed with GPG](https://github.com/blog/2144-gpg-signature-verification)

## Deployment
The project is hosted on GitHub pages in the [stellarterm/stellarterm.github.io](https://github.com/stellarterm/stellarterm.github.io/) repository. The client is wrapped into a single html file and it's sha 256 sum is recorded on each git commit.

## Development instructions
### Prerequisites
Make sure you have Node.js 7.4.0 or higher installed. If not, install it ([Node version manager](https://github.com/creationix/nvm) is recommended).

```sh
# Check your node version using this command
node --version
```

### Environment Setup
```sh
# Clone the project
git clone https://github.com/irisli/stellarterm.git
cd stellarterm

# Install the npm and bower dependencies
npm run setup
```

### Development mode
The build process has tools watches the code and rebuilds if something has changed. It will also serve the app locally (usually http://localhost:3000) and automatically refresh the page when changes are built.

```sh
npm start
```

### Production build
This builds a single index.html file with assets inlined. The single file contains the whole app and can be hosted online. Output file is in `./dist/index.html`.
```sh
npm run production
```

## License
StellarTerm is open source software licensed under the Apache-2.0 license.

### Credits
- Started the project using the super helpful [react-gulp-browserify yeoman generator](https://github.com/randylien/generator-react-gulp-browserify)
