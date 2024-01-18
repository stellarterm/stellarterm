import React from 'react';
import { Asset } from '@stellar/stellar-sdk';
import PropTypes from 'prop-types';
import images from '../../../../images';
import AssetCardSeparateLogo from '../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';
import Driver from '../../../../lib/driver/Driver';

const SwapAsset = ({ asset, d, openList }) => (
    <button className="SwapAsset_container" onClick={openList}>
        {asset ?
            <React.Fragment>
                <div className="SwapAsset_asset">
                    <AssetCardSeparateLogo
                        d={d}
                        code={asset.code}
                        issuer={asset.issuer}
                        logoSize={26}
                        noIssuer
                        circle
                    />
                </div>
                <img src={images.dropdown} alt="" />
            </React.Fragment> :
            <React.Fragment>
                <span>Select an asset</span>
                <img src={images.dropdown} alt="" />
            </React.Fragment>
        }
    </button>
);

export default SwapAsset;

SwapAsset.propTypes = {
    asset: PropTypes.instanceOf(Asset),
    d: PropTypes.instanceOf(Driver),
    openList: PropTypes.func,
};
