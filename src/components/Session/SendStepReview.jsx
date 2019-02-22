import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';

export default function SendStepReview(props) {
    const { d, isCurrentStep } = props;

    return (
        <div className={`Send__panel${!isCurrentStep ? ' is-future' : ''}`}>
            <h3 className={`Send__title${isCurrentStep ? ' is-active' : ''}`}>4. Review</h3>
            <div className="Send__content">
                {isCurrentStep ? (
                    <div className="Send__panel__next">
                        <p>
                            Note: Transactions on the Stellar network are irreversible. Please make sure all the
                            transaction details are correct.
                        </p>
                        <button className="s-button" onClick={d.send.handlers.submit}>
                            Submit transaction
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

SendStepReview.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    isCurrentStep: PropTypes.bool.isRequired,
};
