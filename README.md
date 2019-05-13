[![Travis CI status](https://travis-ci.org/stellarterm/stellarterm.svg?branch=master)](https://travis-ci.org/stellarterm/stellarterm)

# StellarTerm ecosystem - [client](https://stellarterm.com/) | [api](https://github.com/stellarterm/stellarterm/tree/master/api) | [directory](https://github.com/stellarterm/stellarterm/blob/master/directory/)
This StellarTerm monorepo consists of multiple projects built for the [Stellar network](https://www.stellar.org/) including a [trading client](https://stellarterm.com/). The projects are in this monorepo to enable faster development speed.

## Web Client
StellarTerm is a web based trading client for use on the Stellar network. This client aims to make it easy and safe for users of any skill level to trade on the Stellar network by making a clear and secure user interface. Try it out at [https://stellarterm.com](https://stellarterm.com/)

## API for developers (built on AWS Lambda)
The StellarTerm API contains information on the markets on the Stellar network. This information is useful for the StellarTerm client itself as well as other developers that want to use this data.

The API uses the [Serverless framework](https://serverless.com/) for deployment to [AWS Lambda](https://aws.amazon.com/lambda/). The API data is hosted on AWS S3 for high availability.

It is currently under active development and is not yet finished. See it in action here: [https://api.stellarterm.com/](https://api.stellarterm.com/)

## [Directory](https://github.com/stellarterm/stellarterm/blob/master/directory/README.md)
StellarTerm maintains a manually curated directory file with a listing of well known anchors and assets on the Stellar network. For more information, see the [directory README](https://github.com/stellarterm/stellarterm/blob/master/directory/README.md).

-------------------------------------------------------------------------------

## StellarTerm client custom network

### Testnet
To use the testnet, simply add `#testnet` to the url to activate it. To exit, refresh the page where the url is not `#testnet`.

### Custom horizon builds
Some developers may want to use StellarTerm pointed to a custom horizon server or even a custom network. To do this, you must build StellarTerm locally.

The StellarTerm build process checks for the presence of relevant environment variables.

```sh
export STELLARTERM_CUSTOM_HORIZON_URL="https://horizon-testnet.stellar.org"
export STELLARTERM_CUSTOM_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

Once built, the configuration will be embedded into the StellarTerm output file (and the environment variable is no longer needed). To check this, look at the output of `index.html` and search for `stCustomConfig`.

## Deployment
The project is hosted on GitHub pages in the [stellarterm/stellarterm.github.io](https://github.com/stellarterm/stellarterm.github.io/) repository. The client is wrapped into a single html file and it's sha 256 sum is recorded on each git commit.

## Client development instructions
### Prerequisites
Make sure you have Node.js 7.4.0 or higher installed. If not, install it ([Node version manager](https://github.com/creationix/nvm) is recommended).

```sh
# Check your node version using this command
node --version
```

### Environment Setup
```sh
# Clone the project
git clone https://github.com/stellarterm/stellarterm.git
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
Products in the StellarTerm ecosystem is open source software and is licensed under the [Apache-2.0 license](https://github.com/stellarterm/stellarterm/blob/master/LICENSE-2.0.txt). Please understand the license carefully before using StellarTerm.

## Credits
- Started the project using the super helpful [react-gulp-browserify yeoman generator](https://github.com/randylien/generator-react-gulp-browserify)
