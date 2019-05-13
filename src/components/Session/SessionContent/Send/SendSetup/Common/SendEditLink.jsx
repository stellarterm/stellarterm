import React from 'react';
import PropTypes from 'prop-types';

export default function SendEditLink(props) {
    const { stepIsPassed, editStep } = props;

    return stepIsPassed ? (
        <a className="Send__title__edit" onClick={editStep}>
            Edit
        </a>
    ) : null;
}

SendEditLink.propTypes = {
    stepIsPassed: PropTypes.bool.isRequired,
    editStep: PropTypes.func.isRequired,
};
