const Stellarify = {
  orderbookDetails(input) {
    const stellarified = input;
    stellarified.base = this.asset(input.base);
    stellarified.counter = this.asset(input.counter);
    return stellarified;
  },
  asset(input) {
    if (input.asset_type === 'native') {
      return new StellarSdk.Asset.native();
    }
    return new StellarSdk.Asset(input.asset_code, input.asset_issuer);
  },
};

export default Stellarify;
