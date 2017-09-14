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
  code:'JPY',
  issuer: 'GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM'
}, 86400)
.then(result => {
  console.log(result)
})
