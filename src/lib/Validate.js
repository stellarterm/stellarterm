import _ from 'lodash';
import directory from '../directory';

const Validate = {
  publicKey(input) {
    return StellarSdk.Keypair.isValidPublicKey(input);
  },
  assetCode(input) {
    return _.isString(input) && input.match(/^[a-zA-Z0-9]+$/g) && input.length > 0 && input.length < 12;
  }
};

export default Validate;
