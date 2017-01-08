// For pretty printing in the UI
const Printify = {
  assetName(asset) {
    // lumens is lowercase while all asset codes are uppercase
    return asset.isNative() ? 'lumens' : asset.getCode();
  }
}

export default Printify;
