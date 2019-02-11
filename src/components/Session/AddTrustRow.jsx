import React from 'react';
import PropTypes from 'prop-types';

import Driver from '../../lib/Driver';
import AssetCard2 from '../AssetCard2';
import TrustButton from './TrustButton';

export default function AddTrustRow(props) {
    return (
        <div className="AddTrustRow row">
            <div className="row__assetCard2">
                <AssetCard2 code={props.asset.getCode()} issuer={props.asset.getIssuer()} />
            </div>
            <TrustButton
                d={props.d}
                asset={props.asset}
                message={`${props.asset.getCode()} accepted`}
                trustMessage={`Accept ${props.asset.getCode()}`} />
        </div>
    );
}

AddTrustRow.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.instanceOf(StellarSdk.Asset).isRequired,
};
