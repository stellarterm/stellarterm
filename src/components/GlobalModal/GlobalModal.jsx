import React from 'react';
import PropTypes from 'prop-types';
import MultisigEnableStep1
    from './../Session/SessionContent/Multisig/MultisigDisabled/MultisigEnableStep1/MultisigEnableStep1';
import MultisigEnableStep2
    from './../Session/SessionContent/Multisig/MultisigDisabled/MultisigEnableStep2/MultisigEnableStep2';
import MultisigEnableStep3
    from './../Session/SessionContent/Multisig/MultisigDisabled/MultisigEnableStep3/MultisigEnableStep3';

import MultisigDisableModal
    from './../Session/SessionContent/Multisig/MultisigEnabled/MultisigDisableModal/MultisigDisableModal';
import MultisigSetRequiredSigners
    from './../Session/SessionContent/Multisig/MultisigEnabled/MultisigSetRequiredSigners/MultisigSetRequiredSigners';
import Driver from '../../lib/Driver';
import SignWithLedgerModal from './LedgerModal/LedgerModal';
import TransactionSummary from './TransactionSummary/TransactionSummary';
import MultisigSubmitModal from './MultisigSubmitModal/MultisigSubmitModal';
import MultisigUnknownSubmitModal from './MultisigUnknownSubmitModal/MultisigUnknownSubmitModal';

export default class GlobalModal extends React.Component {
    constructor(props) {
        super(props);
        this.unsub = this.props.d.modal.event.sub(() => {
            this.forceUpdate();
        });
        this.state = {};
    }
    componentWillUnmount() {
        this.unsub();
    }

    componentDidCatch(error) {
        console.error(error);
        this.setState({});
    }

    render() {
        const d = this.props.d;
        const modal = d.modal;
        let body;

        if (modal.modalName === 'sign') {
            let laboratoryContent;
            if (
                d.session.account.inflation_destination === 'GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW'
            ) {
                laboratoryContent = (
                    <div className="GlobalModal__content">
                        <a
                            href={`https://www.stellar.org/laboratory/#txsigner?xdr=
                              ${encodeURI(modal.inputData.toEnvelope().toXDR('base64'))}&network=public`}
                            target="_blank"
                            rel="nofollow noopener noreferrer">
                            View in Stellar Laboratory
                        </a>
                    </div>
                );
            }
            // To get tx xdr: modal.inputData.toEnvelope().toXDR('base64')
            body = (
                <div className="GlobalModal">
                    <div className="GlobalModal__header">Sign transaction</div>
                    <div className="GlobalModal__content">
                        <TransactionSummary tx={modal.inputData} />
                    </div>
                    {laboratoryContent}
                    <div className="GlobalModal__navigation">
                        <button
                            className="s-button s-button--light"
                            onClick={() => {
                                d.modal.handlers.cancel();
                            }}>
                            Cancel
                        </button>
                        <button
                            className="s-button"
                            onClick={() => {
                                d.modal.handlers.finish();
                            }}>
                            Sign
                        </button>
                    </div>
                </div>
            );
        } else if (modal.modalName === 'signWithLedger') {
            body = <SignWithLedgerModal d={d} />;
        } else if (modal.modalName === 'multisig') {
            body = <MultisigSubmitModal signer={modal.inputData} submit={d.modal.handlers} />;
        } else if (modal.modalName === 'multisigUnknown') {
            body = <MultisigUnknownSubmitModal tx={modal.inputData} submit={d.modal.handlers} />;
        } else if (modal.modalName === 'multisigEnableStep1') {
            body = <MultisigEnableStep1 submit={d.modal.handlers} d={modal.inputData} />;
        } else if (modal.modalName === 'multisigEnableStep2') {
            body = <MultisigEnableStep2 submit={d.modal.handlers} d={modal.inputData} />;
        } else if (modal.modalName === 'multisigEnableStep3') {
            body = <MultisigEnableStep3 submit={d.modal.handlers} signerData={modal.inputData} d={d} />;
        } else if (modal.modalName === 'multisigDisableModal') {
            body = <MultisigDisableModal submit={d.modal.handlers} signerKey={modal.inputData} d={d} />;
        } else if (modal.modalName === 'multisigSetRequiredSigners') {
            body = <MultisigSetRequiredSigners submit={d.modal.handlers} d={d} />;
        } else {
            body = (
                <div className="GlobalModal">
                    <div className="GlobalModal__content">Error: missing modal {modal.modalName}</div>
                    <div className="GlobalModal__navigation">
                        <button
                            className="s-button s-button--light"
                            onClick={() => {
                                d.modal.handlers.cancel();
                            }}>
                            Cancel
                        </button>
                    </div>
                </div>
            );
        }

        return <div className={`GlobalModalBackdrop${d.modal.active ? '' : ' is-hidden'}`}>{body}</div>;
    }
}
GlobalModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
