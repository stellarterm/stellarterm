import _ from 'lodash';
import directory from '../directory';

// Some validation regexes and rules in this file are taken from Stellar Laboratory
// Do not take code out from this file into other files
// Stellar Laboratory is licensed under Apache 2.0
// https://github.com/stellar/laboratory

const Validate = {
  publicKey(input) {
    if (input === '') {
      return null;
    }
    return StellarSdk.Keypair.isValidPublicKey(input);
  },
  assetCode(input) {
    return _.isString(input) && input.match(/^[a-zA-Z0-9]+$/g) && input.length > 0 && input.length < 12;
  },
  amount(input) {
    if (input === '') {
      return null;
    }
    let inputIsPositive = !!input.charAt(0) !== '-';
    let inputValidNumber = !!input.match(/^[0-9]*(\.[0-9]+){0,1}$/g);
    let inputPrecisionLessThan7 = !input.match(/\.([0-9]){8,}$/g);
    return inputIsPositive && inputValidNumber && inputPrecisionLessThan7;
  },
};

export default Validate;
