import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';

export default function SendError(props) {
    const { errorDetails, handlers } = props.d.send;

    return (
        <div className="island">
            <div className="island__header">Send Payment</div>
            <h3 className="Send__resultTitle">Error</h3>
            <p className="Send_errorText">{errorDetails}</p>
            <button className="s-button Send__startOver" onClick={handlers.reset}>
                Start over
            </button>
        </div>
    );
}

SendError.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
