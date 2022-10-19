import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Driver from '../../../lib/driver/Driver';
import SignChallengeBlock from '../../Common/SignChallengeBlock/SignChallengeBlock';
import Stellarify from '../../../lib/helpers/Stellarify';
import AssetRow from '../../Common/AssetRow/AssetRow';


const SignChallengeWithMultisig = ({ d, submit, data }) => {
    let parsedAsset;
    try {
        const urlParams = new URLSearchParams(window.location.search);
        parsedAsset = Stellarify.parseAssetSlug(urlParams.get('asset'));
    } catch (e) {
        parsedAsset = null;
    }


    return (<div className="SignChallengeWithMultisig">
        <div className="Modal_header">
            <span>Transfer history</span>
            <img
                src={images['icon-close']}
                alt="X"
                onClick={() => {
                    submit.cancel();
                }}
            />
        </div>
        <div className="SignChallengeWithMultisig_content">
            <div className="SignChallengeWithMultisig_asset">
                <AssetRow d={d} asset={parsedAsset} hideMessage />
            </div>

            <div className="SignChallengeWithMultisig_main">
                <SignChallengeBlock challengeTx={data.tx} signedChallengeResolver={data.resolver} d={d} />
            </div>
        </div>
    </div>);
};

export default SignChallengeWithMultisig;

SignChallengeWithMultisig.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    d: PropTypes.instanceOf(Driver).isRequired,
    data: PropTypes.shape({
        tx: PropTypes.string,
        resolver: PropTypes.func,
    }),
};
