import React from 'react';
import PropTypes from 'prop-types';

const images = require('./../../../../images');


export default function Sep7ErrorModal(props) {
    return (
        <div className="Sep7ErrorModal">
            <div className="Modal_header">
                <span>Invalid request</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        props.submit.cancel();
                        window.history.pushState({}, null, '/');
                    }} />
            </div>
            <div className="Sep7ErrorModal_title">
                <img src={images['icon-circle-fail']} alt="fail" />
                <span>{props.error || 'Unknown error!'}</span>
            </div>
            <div className="Sep7ErrorModal_content">
                <span>This transaction signature request contains invalid or unsupported data and can not be signed.</span>
            </div>
            <div className="Modal_button-block">
                <button
                    className="s-button"
                    onClick={() => {
                        props.submit.cancel();
                        window.history.pushState({}, null, '/');
                    }}>
                    Close
                </button>
            </div>
        </div>
    );
}
Sep7ErrorModal.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    error: PropTypes.string,
};
