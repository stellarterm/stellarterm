import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';

export default function SendSuccess(props) {
    const { txId, handlers } = props.d.send;

    const resultMessage = !props.awaitSiners ? (
        <p>
            Transaction ID:{' '}
            <a
                target="_blank"
                rel="noopener noreferrer"
                title="stellar.expert"
                href={`https://stellar.expert/explorer/public/tx/${txId}`}>
                {txId}
            </a>
            <br />
            Keep the transaction ID as proof of payment.
        </p>
    ) : (
        <p>Transaction was signed with your key. Add additional signatures and submit to the network.</p>
    );

    return (
        <div className="so-back islandBack islandBack--t">
            <div className="island">
                <div className="island__header">Send Payment</div>
                <h3 className="Send__resultTitle">Success!</h3>
                <div className="Send__resultContent">
                    {resultMessage}
                </div>
                <button className="s-button Send__startOver" onClick={handlers.reset}>
                    Start over
                </button>
            </div>
        </div>
    );
}

SendSuccess.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    awaitSiners: PropTypes.bool,
};
