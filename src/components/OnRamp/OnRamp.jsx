import React from 'react';
import PropTypes from 'prop-types';
import { getUrlWithParams } from '../../lib/api/endpoints';
import Driver from '../../lib/driver/Driver';
import { SESSION_STATE } from '../../lib/constants/sessionConstants';
import { onRampUrl, onRampStaticParams } from './constants';

const getOnRampIframeLink = isLoggedIn => {
    const onRampParams = { ...onRampStaticParams };

    if (isLoggedIn) {
        onRampParams.defaultCrypto = 'xlm_stellar';
    }

    return getUrlWithParams(onRampUrl, onRampParams, true);
};

const OnRamp = ({ d }) => {
    const isLoggedIn = d.session.state === SESSION_STATE.IN;

    const onRampIframeLink = getOnRampIframeLink(isLoggedIn);

    return (
        <div className="OnRamp_container">
            <iframe
                className="OnRamp_Iframe"
                src={onRampIframeLink}
                title="Onramper Widget"
                height="700px"
                width="620px"
                allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
            />
        </div>
    );
};

OnRamp.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

export default OnRamp;
