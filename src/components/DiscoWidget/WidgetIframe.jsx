import React from 'react';
import { useLocation } from 'react-router-dom';
import { getUrlWithParams } from '../../lib/api/endpoints';
import { widgetUrl, widgetStaticParams } from './constants';

const getWidgetIframeLink = (cryptoLetterId, networkLetterId, stellarPubKey) => {
    const widgetParams = { ...widgetStaticParams };

    if (cryptoLetterId) {
        widgetParams.defaultAsset = cryptoLetterId;
        widgetParams.defaultNetwork = networkLetterId;
    }

    if (stellarPubKey) {
        widgetParams.wallets = `stellar:${stellarPubKey}`;
    }

    return getUrlWithParams(widgetUrl, widgetParams, true);
};

const DiscoWidget = props => {
    const stellarPubKey = props.d?.session?.account?.accountId() || props.d?.session?.unfundedAccountId;

    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const urlCrypto = urlParams.get('crypto');
    const urlNetwork = urlParams.get('network');

    return (
        <div className="Widget_container">
            <iframe
                className="Widget_Iframe"
                src={getWidgetIframeLink(urlCrypto, urlNetwork, stellarPubKey)}
                title="Coindisco Widget"
                height="700px"
                width="430px"
                allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
            />
        </div>
    );
};

export default DiscoWidget;
