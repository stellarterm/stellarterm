const _ = require('lodash');
const StellarSdk = require('stellar-sdk');
const directory = require('../../directory.json');
const tradeWalker = require('./tradeWalker');

Server = new StellarSdk.Server('https://horizon.stellar.org');
StellarSdk.Network.usePublicNetwork();



tradeWalker.walkUntil(Server, {
  code: 'XLM',
  issuer: null,
}, {
  code:'CNY',
  issuer: 'GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX'
}, 86400)
.then(result => {
  console.log(result)
})
