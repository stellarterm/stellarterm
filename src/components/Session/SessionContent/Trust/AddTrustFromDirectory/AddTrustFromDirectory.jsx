import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import _ from 'lodash';
import directory from 'stellarterm-directory';
import Driver from '../../../../../lib/driver/Driver';
import AssetRow from '../../../../Common/AssetRow/AssetRow';

export default function AddTrustFromDirectory(props) {
    const assetRows = [];
    const assetAdded = {};
    // Used for not-duplicate items check
    const ticker = props.d.ticker;

    if (ticker.ready) {
        ticker.data.assets.forEach(asset => {
            const assetIsNotXLM = asset.id !== 'XLM-native';

            if (assetIsNotXLM) {
                const sdkAsset = new StellarSdk.Asset(asset.code, asset.issuer);

                const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);

                if (!directoryAsset.unlisted && !directoryAsset.disabled) {
                    assetAdded[asset.id] = true;
                    assetRows.push(<AssetRow key={asset.id} d={props.d} asset={sdkAsset} />);
                }
            }
        });
    }

    _.each(directory.assets, assetObj => {
        const basicSlug = `${assetObj.code}-${assetObj.issuer}`;

        if (!(basicSlug in assetAdded)) {
            const asset = new StellarSdk.Asset(assetObj.code, assetObj.issuer);
            if (!assetObj.unlisted && !assetObj.disabled) {
                assetRows.push(<AssetRow key={basicSlug} d={props.d} asset={asset} />);
            }
        }
    });

    return (
        <div className="island">
            <div className="island__header">Accept more assets</div>
            <div className="island__paddedContent">
                <p>
                    This is a list of anchors from the Stellar community.
                    <br />
                    Note: Zingy Trader does not endorse any of these anchors.
                </p>
            </div>
            <div className="AssetRowContainer">{assetRows}</div>
        </div>
    );
}

AddTrustFromDirectory.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
