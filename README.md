[![Travis CI status](https://travis-ci.org/irisli/stellarterm.svg?branch=master)](https://travis-ci.org/irisli/stellarterm) [ ![Codeship Status](https://img.shields.io/codeship/af24fda0-b980-0134-5c05-4ec9827c52a2/master.svg)](https://app.codeship.com/projects/195032)

# StellarTerm - Try it out at [stellarterm.com](https://stellarterm.com/)

StellarTerm is a web based trading client for use on the Stellar network. This client aims to make it easy and safe for users of any skill level to trade on the Stellar network by making a clear and secure user interface.

## Screenshots


### A detailed user friendly orderbook
![Orderbook](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/orderbook.png)

### Ability to add trust either from a curated list, manually, or via federation
![Adding trust from directories](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/adding-trust-from-directory.png)

![Adding trust via federation](https://raw.githubusercontent.com/irisli/stellarterm/master/screenshots/adding-trust-via-federation.png)

### Price history charts (coming soon)
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
