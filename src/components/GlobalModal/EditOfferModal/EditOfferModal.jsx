import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import OfferMaker from '../../Exchange/OfferMakers/OfferMaker/OfferMaker';
import Driver from '../../../lib/Driver';


export default function EditOfferModal(props) {
    const { submit, offerData, d } = props;
    const { side, rectifiedOffer } = offerData;
    return (
        <div className="EditOfferModal">
            <div className="Modal_header">
                <span>Edit {side} offer</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => submit.cancel()} />
            </div>
            <div className="EditOfferModal_content">
                <OfferMaker side={side} d={d} existingOffer={rectifiedOffer} />
            </div>
        </div>
    );
}
EditOfferModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
    offerData: PropTypes.objectOf(PropTypes.any),
};
