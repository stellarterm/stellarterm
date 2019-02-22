import React from 'react';
import PropTypes from 'prop-types';

export default function SendStepEditLink(props) {
    const { stepIsPassed, editStep } = props;

    return stepIsPassed ? (
        <a className="Send__title__edit" onClick={editStep}>
            Edit
        </a>
    ) : null;
}

SendStepEditLink.propTypes = {
    stepIsPassed: PropTypes.bool.isRequired,
    editStep: PropTypes.func.isRequired,
};
