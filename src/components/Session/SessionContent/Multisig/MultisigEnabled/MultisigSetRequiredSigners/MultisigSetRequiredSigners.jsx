import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';

const images = require('../../../../../../images');


export default class MultisigSetRequiredSigners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            requiredSigners: (props.d.session.account.thresholds.low_threshold / 10),
        };
    }

    setRequiredSigners() {
        this.props.d.session.handlers.setRequiredSigners(this.state.requiredSigners)
            .then(() => this.props.submit.cancel())
            .catch(e => console.log(e));
    }

    handleChoose(key) {
        const { requiredSigners } = this.state;
        const { signers } = this.props.d.session.account;

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
        const { signers } = d.session.account;
        const noChanges = this.state.requiredSigners === (d.session.account.thresholds.low_threshold / 10);

        return (
            <div className="MultisigSetRequiredSigners">
                <div className="Modal_header">
                    <span>Required signatures</span>
                    <img src={images['icon-close']} alt="X" onClick={() => submit.cancel()} />
                </div>
                <div className="MultisigSetRequiredSigners_content">
                    <div className="MultisigSetRequiredSigners_title">
                        Set number of signatures required to make transactions.
                        You have {signers.length - 1} signers total. (Your account + {signers.length - 2} co-signers)
                    </div>
                    <div className="MultisigSetRequiredSigners_setup">
                        <div className="MultisigSetRequiredSigners_setup-info">
                            <span>
                                Signatures required for transactions
                            </span>
                            <span>
                                {this.state.requiredSigners} of {signers.length - 1}{' '}
                                 will required. (You account + {this.state.requiredSigners - 1} co-signers)
                            </span>
                        </div>
                        <div className="MultisigSetRequiredSigners_setup-handler">
                            <div onClick={() => this.handleChoose('remove')}>-</div>
                            <div>{this.state.requiredSigners}</div>
                            <div onClick={() => this.handleChoose('add')}>+</div>
                        </div>
                    </div>
                </div>
                <div className="Modal_button-block">
                    <button className="cancel-button" onClick={() => submit.cancel()}>Cancel</button>
                    <button
                        className="s-button"
                        disabled={noChanges}
                        onClick={() => this.setRequiredSigners()}>
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
