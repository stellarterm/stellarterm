import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../lib/driver/Driver';
import OfferMaker from './OfferMaker/OfferMaker';
import AssetRow from '../../Common/AssetRow/AssetRow';
import { SESSION_STATE } from '../../../lib/constants/sessionConstants';


export default function OfferMakers(props) {
    if (!props.d.orderbook.data.ready) {
        return <div>Loading</div>;
    }

    const trustNeededAssets = [];
    const login = props.d.session.state === SESSION_STATE.IN;
    if (login) {
        const { baseBuying, counterSelling } = props.d.orderbook.data;
        const { account } = props.d.session;
        const baseBalance = account.getBalance(baseBuying);
        const counterBalance = account.getBalance(counterSelling);
        if (baseBalance === null) {
            trustNeededAssets.push(baseBuying);
        }

        if (counterBalance === null) {
            trustNeededAssets.push(counterSelling);
        }
    }
    const hasTrustNeeded = !!trustNeededAssets.length;
    return (
        <div>
            <div className="OfferMakers island__sub">
                <div className="OfferMakers_maker island__sub__division">
                    <OfferMaker d={props.d} side="buy" hasTrustNeeded={hasTrustNeeded} />
                </div>
                <div className="OfferMakers_maker island__sub__division">
                    <OfferMaker d={props.d} side="sell" hasTrustNeeded={hasTrustNeeded} />
                </div>
            </div>
            {hasTrustNeeded && (
                <div className="OfferMakers_acceptAsset">
                    <p className="offer_acceptAsset">To trade, activate these assets on your account:</p>
                    <div className="AssetRowContainer">
                        {trustNeededAssets.map(asset => (
                            <AssetRow d={props.d} asset={asset} key={asset.issuer} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
OfferMakers.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
