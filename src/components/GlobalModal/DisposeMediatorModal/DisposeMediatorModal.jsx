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
                <span>Smart Swap V2</span>
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
                    Return the tokens from the mediator account.
                </div>
                <div className="SwapSavings_description">
                    You have tokens left on the mediator account after completing Smart Swap V2!
                    Do you want to retrieve them?
                </div>

                <button className="s-button" onClick={() => dispose()}>
                    {pending ? <div className="nk-spinner" /> : 'Return'}
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
