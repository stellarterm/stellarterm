import React from 'react';
import PropTypes from 'prop-types';
import OfferMaker from './OfferMaker';
import Driver from '../lib/Driver';

export default function OfferMakers(props) {
    if (!props.d.orderbook.data.ready) {
        console.log(props.d.orderbook.data.ready);

        return (
            <div>Loading</div>
        );
    }

    return (
        <div className="OfferMakers island__sub">
            <div className="OfferMakers_maker island__sub__division">
                <OfferMaker d={props.d} side="buy" />
            </div>
            <div className="OfferMakers_maker island__sub__division">
                <OfferMaker d={props.d} side="sell" />
            </div>
        </div>
    );
}
OfferMakers.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
