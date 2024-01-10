import React from 'react';
import { Asset } from '@stellar/stellar-sdk';
import PropTypes from 'prop-types';
import images from '../../../../images';
import AssetCardSeparateLogo from '../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';
import Driver from '../../../../lib/driver/Driver';
import { formatNumber } from '../../../../lib/helpers/Format';


const SwapSuccess = ({ submit, d, details }) => {
    const { source, sourceAmount, destination, destinationAmount, hash } = details;
    return (
        <div className="SwapSuccess">
            <div className="Modal_header">
                <span>Transaction success</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        submit.cancel();
                    }}
                />
            </div>

            <div className="SwapSuccess_content">
                <img src={images['icon-big-circle-success']} alt="success" />

                <div className="SwapSuccess_title">Success!</div>

                <div className="SwapSuccess_details">
                    <AssetCardSeparateLogo
                        d={d}
                        code={source.code}
                        issuer={source.issuer}
                        logoSize={26}
                        circle
                        onlyLogo
                    />

                    <span className="SwapSuccess_amount">{formatNumber(sourceAmount)} {source.code}</span>

                    <img src={images['icon-arrow-right-green']} alt="->" className="SwapSuccess_details-arrow" />

                    <AssetCardSeparateLogo
                        d={d}
                        code={destination.code}
                        issuer={destination.issuer}
                        logoSize={26}
                        circle
                        onlyLogo
                    />

                    <span className="SwapSuccess_amount">{formatNumber(destinationAmount)} {destination.code}</span>
                </div>

                <div className="SwapSuccess_buttons">
                    <button
                        className="cancel-button"
                        onClick={() => {
                            window.open(`https://stellar.expert/explorer/${d.Server.isTestnet ? 'testnet' : 'public'}/tx/${hash}`, '_blank');
                        }}
                    >
                        View details
                    </button>
                    <button className="s-button" onClick={() => submit.cancel()}>Done</button>
                </div>
            </div>
        </div>
    );
};

export default SwapSuccess;

SwapSuccess.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
    details: PropTypes.shape({
        source: PropTypes.instanceOf(Asset),
        destination: PropTypes.instanceOf(Asset),
        sourceAmount: PropTypes.string,
        destinationAmount: PropTypes.string,
        hash: PropTypes.string,
    }),
};
