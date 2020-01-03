import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';
import images from '../../../../../images';

export default function SendError(props) {
    const { errorDetails, resetSendForm } = props.d.send;

    return (
        <div className="Send_block">
            <div className="Send_details">
                <img src={images['icon-big-circle-failed']} alt="failed" className="status_icon" />
                <h1>Failed</h1>
                <div className="field_description">
                    {errorDetails}
                </div>
            </div>

            <div className="Send_button_block send_btn_error">
                <button className="s-button" onClick={() => resetSendForm()}>
                    Back
                </button>
            </div>
        </div>
    );
}

SendError.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
