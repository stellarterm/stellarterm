import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Mediator } from '@stellar-broker/client';
import images from '../../../images';
import Driver from '../../../lib/driver/Driver';


const DisposeMediatorModal = ({ submit, d }) => {
    const [pending, setPending] = useState(false);
    const dispose = () => {
        setPending(true);
        Mediator.disposeObsoleteMediators(d.session.account.accountId(), async transaction => {
            const result = await d.session.handlers.sign(transaction, true);
            return result.signedTx;
        }).then(() => {
            setPending(false);
            submit.finish();
        });
    };
    return (
        <div className="Modal DisposeMediatorModal SwapSavings">
            <div className="Modal_header">
                <span>Stellar Broker</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        submit.cancel();
                    }}
                />
            </div>

            <div className="SwapSavings_content">
                <div className="SwapSavings_title">
                    Retrieve Tokens from Mediator Account
                </div>
                <div className="SwapSavings_description">
                    Oops! It looks like some tokens are still in your Stellar Broker Mediator Account
                    from the last swap. You can learn more about how Stellar Broker swaps work in the
                    StellarTerm settings. For assistance, please contact
                    {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
                    <a href="mailto:support@stellarterm.com" target="_blank" rel="noopener noreferrer">
                        support@stellarterm.com
                    </a>
                    <br />
                    <br />
                    Would you like to move these funds to your main account now?
                </div>

                <button className="s-button" onClick={() => dispose()}>
                    {pending ? <div className="nk-spinner" /> : 'Retrieve Funds'}
                </button>
            </div>
        </div>
    );
};

export default DisposeMediatorModal;

DisposeMediatorModal.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    d: PropTypes.instanceOf(Driver).isRequired,
};
