import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

export default function MultisigSubmitModal(props) {
    const { signer, submit } = props;
    return (
        <div className="MultisigSubmitModal ">
            <div className="MultisigSubmitModal__header">
                Sign transaction with {signer.title}
            </div>
            <div className="MultisigSubmitModal__content">
                <img
                    src={images[signer.logo]}
                    className="MultisigSubmitModal__logo"
                    alt={signer.title} />
                <span>Transaction has been sent to {signer.title}</span>
            </div>
            <div className="MultisigSubmitModal__navigation">
                <button className="MultisigSubmitModal__button" onClick={() => submit.cancel()}>Ok</button>
            </div>
        </div>
    );
}
MultisigSubmitModal.propTypes = {
    signer: PropTypes.objectOf(PropTypes.string),
    submit: PropTypes.objectOf(PropTypes.func),
};

