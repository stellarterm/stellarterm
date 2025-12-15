import React from 'react';
import { useLocation } from 'react-router-dom';
import { getUrlWithParams } from '../../lib/api/endpoints';
import { widgetUrl, widgetStaticParams } from './constants';

const getWidgetIframeLink = (cryptoLetterId, networkLetterId) => {
    const widgetParams = { ...widgetStaticParams };

    if (cryptoLetterId) {
        widgetParams.defaultAsset = cryptoLetterId;
        widgetParams.defaultNetwork = networkLetterId;
    }

    return getUrlWithParams(widgetUrl, widgetParams, true);
};

const DiscoWidget = () => {
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const urlCrypto = urlParams.get('crypto');
    const urlNetwork = urlParams.get('network');

    return (
        <div className="Widget_container">
            <iframe
                className="Widget_Iframe"
                src={getWidgetIframeLink(urlCrypto, urlNetwork)}
                title="Coindisco Widget"
                height="700px"
                width="430px"
                allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
            />
        </div>
    );
};

export default DiscoWidget;
