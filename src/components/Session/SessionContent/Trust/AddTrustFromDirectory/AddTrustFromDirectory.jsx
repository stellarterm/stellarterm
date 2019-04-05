import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import directory from '../../../../../directory';
import Driver from '../../../../../lib/Driver';
import AddTrustRow from '../Common/AddTrustRow';

export default function AddTrustFromDirectory(props) {
    const assetRows = [];
    const assetAdded = {};
    // Used for not-duplicate items check
    const ticker = props.d.ticker;

    if (ticker.ready) {
        ticker.data.assets.forEach((asset) => {
            const assetIsNotXLM = asset.id !== 'XLM-native';

            if (assetIsNotXLM) {
                const sdkAsset = new StellarSdk.Asset(asset.code, asset.issuer);
                assetAdded[asset.id] = true;
                assetRows.push(<AddTrustRow key={asset.id} d={props.d} asset={sdkAsset} />);
            }
        });
    }

    _.each(directory.assets, (assetObj) => {
        const basicSlug = `${assetObj.code}-${assetObj.issuer}`;

        if (!(basicSlug in assetAdded)) {
            const asset = new StellarSdk.Asset(assetObj.code, assetObj.issuer);
            assetRows.push(<AddTrustRow key={basicSlug} d={props.d} asset={asset} />);
        }
    });

    return (
        <div className="island">
            <div className="island__header">Accept more assets</div>
            <div className="island__paddedContent">
                <p>
                    This is a list of anchors from the Stellar community.
                    <br />
                    Note: StellarTerm does not endorse any of these anchors.
                </p>
            </div>
            <div className="AddTrustFromDirectory">{assetRows}</div>
        </div>
    );
}

AddTrustFromDirectory.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
