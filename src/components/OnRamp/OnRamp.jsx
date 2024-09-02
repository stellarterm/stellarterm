import React from 'react';
import { useLocation } from 'react-router-dom';
import { getUrlWithParams } from '../../lib/api/endpoints';
import { onRampUrl, onRampStaticParams } from './constants';

const getOnRampIframeLink = code => {
    const onRampParams = { ...onRampStaticParams };

    if (code) {
        onRampParams.defaultCrypto = code;
    }

    return getUrlWithParams(onRampUrl, onRampParams, true);
};

const OnRamp = () => {
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const urlCrypto = urlParams.get('crypto');
    const onRampIframeLink = getOnRampIframeLink(urlCrypto);

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

export default OnRamp;
