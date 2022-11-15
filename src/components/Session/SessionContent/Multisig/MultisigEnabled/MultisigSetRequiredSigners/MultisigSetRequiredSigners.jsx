import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/driver/Driver';
import { AUTH_TYPE } from '../../../../../../lib/constants/sessionConstants';

const images = require('../../../../../../images');

export default class MultisigSetRequiredSigners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            requiredSigners: props.d.multisig.requiredSigners,
        };
    }

    setRequiredSigners() {
        const { d, submit } = this.props;
        const { authType } = d.session;
        if (authType === AUTH_TYPE.LEDGER) {
            submit.cancel();
        }
        d.multisig.setRequiredSigners(this.state.requiredSigners)
            .then(() => {
                if (authType !== AUTH_TYPE.WALLET_CONNECT) {
                    submit.cancel();
                }
            })
            .catch(e => console.log(e));
    }

    handleChoose(key) {
        const { requiredSigners } = this.state;
        const { signers } = this.props.d.multisig;

        if (key === 'add' && requiredSigners === signers.length - 1) {
            return;
        }
        if (key === 'remove' && requiredSigners === 2) {
            return;
        }

        this.setState({ requiredSigners: key === 'add' ? (requiredSigners + 1) : (requiredSigners - 1) });
    }

    render() {
        const { submit, d } = this.props;
        const { signers } = d.multisig;
        const { requiredSigners } = this.state;
        const noChanges = requiredSigners === d.multisig.requiredSigners;

        return (
            <div className="MultisigSetRequiredSigners">
                <div className="Modal_header">
                    <span>Required signatures</span>
                    <img src={images['icon-close']} alt="X" onClick={() => submit.cancel()} />
                </div>
                <div className="MultisigSetRequiredSigners_content">
                    <div className="MultisigSetRequiredSigners_title">
                        Set number of signatures required to make transactions.
                        You have {signers.length - 1} signers total. (Your account + {signers.length - 2} co-signer
                        {signers.length > 3 && 's'})
                    </div>
                    <div className="MultisigSetRequiredSigners_setup">
                        <div className="MultisigSetRequiredSigners_setup-info">
                            <span>
                                Signatures required for transactions
                            </span>
                            <span>
                                {requiredSigners} of {signers.length - 1}{' '}
                                 will required. (You account + {requiredSigners - 1} co-signer
                                {requiredSigners > 2 && 's'})
                            </span>
                        </div>
                        <div className="MultisigSetRequiredSigners_setup-handler">
                            <div
                                className={requiredSigners === 2 ? 'disabled' : ''}
                                onClick={() => this.handleChoose('remove')}
                            >-</div>
                            <div>{requiredSigners}</div>
                            <div
                                className={requiredSigners === signers.length - 1 ? 'disabled' : ''}
                                onClick={() => this.handleChoose('add')}
                            >+</div>
                        </div>
                    </div>
                </div>
                <div className="Modal_button-block">
                    <button className="cancel-button" onClick={() => submit.cancel()}>Cancel</button>
                    <button
                        className="s-button"
                        disabled={noChanges}
                        onClick={() => this.setRequiredSigners()}
                    >
                        Save
                    </button>
                </div>
            </div>
        );
    }
}
MultisigSetRequiredSigners.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    d: PropTypes.instanceOf(Driver),
};
