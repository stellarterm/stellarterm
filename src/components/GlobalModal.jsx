import React from 'react';
import PropTypes from 'prop-types';
import TransactionSummary from './TransactionSummary';
import SignWithLedgerModal from './SignWithLedgerModal';
import MultisigSubmitModal from './MultisigSubmitModal';
import MultisigUnknownSubmitModal from './MultisigUnknownSubmitModal';
import Driver from '../lib/Driver';

export default class GlobalModal extends React.Component {
    constructor(props) {
        super(props);
        this.unsub = this.props.d.modal.event.sub(() => { this.forceUpdate(); });
        this.state = {
        };
    }
    componentWillUnmount() {
        this.unsub();
    }

    componentDidCatch(error) {
        console.error(error);
        this.setState({
        });
    }

    render() {
        const d = this.props.d;
        const modal = d.modal;
        let body;


        if (modal.modalName === 'sign') {
            let laboratoryContent;
            if (d.session.account.inflation_destination === 'GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW') {
                laboratoryContent = (
                    <div className="GlobalModal__content">
                        <a
                            href={`https://www.stellar.org/laboratory/#txsigner?xdr=
                              ${encodeURI(modal.inputData.toEnvelope().toXDR('base64'))}&network=public`}
                            target="_blank"
                            rel="nofollow noopener noreferrer">View in Stellar Laboratory</a>
                   </div>
                );
            }
        // To get tx xdr: modal.inputData.toEnvelope().toXDR('base64')
            body = (
                <div className="GlobalModal">
                    <div className="GlobalModal__header">
                        Sign transaction
                    </div>
                    <div className="GlobalModal__content">
                       <TransactionSummary tx={modal.inputData} />
                    </div>
                    {laboratoryContent}
                    <div className="GlobalModal__navigation">
                        <button
                            className="s-button s-button--light"
                            onClick={() => { d.modal.handlers.cancel(); }}>Cancel</button>
                        <button className="s-button" onClick={() => { d.modal.handlers.finish(); }}>Sign</button>
                    </div>
                </div>
            );
        } else if (modal.modalName === 'signWithLedger') {
            body = <SignWithLedgerModal d={d} />;
        } else if (modal.modalName === 'multisig') {
            body = <MultisigSubmitModal signer={modal.inputData} submit={d.modal.handlers} />;
        } else if (modal.modalName === 'multisigUnknown') {
            body = <MultisigUnknownSubmitModal tx={modal.inputData} submit={d.modal.handlers} />;
        } else {
            body = (
                <div className="GlobalModal">
                    <div className="GlobalModal__content">
                        Error: missing modal {modal.modalName}
                    </div>
                    <div className="GlobalModal__navigation">
                        <button
                            className="s-button s-button--light"
                            onClick={() => { d.modal.handlers.cancel(); }}>Cancel</button>
                    </div>
                </div>
            );
        }

        return (
          <div className={`GlobalModalBackdrop${d.modal.active ? '' : ' is-hidden'}`}>
              {body}
          </div>
        );
    }
}
GlobalModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
