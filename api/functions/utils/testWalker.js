const _ = require('lodash');
const StellarSdk = require('stellar-sdk');
const directory = require('../../directory.json');
const tradeWalker = require('./tradeWalker');
const { HORIZON_SERVER } = require('../horizon-server.constant');

Server = new StellarSdk.Server(HORIZON_SERVER);
StellarSdk.Network.usePublicNetwork();



tradeWalker.walkUntil(Server, {
  code: 'XLM',
  issuer: null,
}, {
  code:'BTC',
  issuer: 'GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF'
}, 86400)
.then(result => {
  console.log(result)
})
