import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/driver/Driver';
import MultisigEnableStep1 from './../Session/SessionContent/Multisig/MultisigDisabled/MultisigEnableStep1/MultisigEnableStep1';
import MultisigEnableStep2 from './../Session/SessionContent/Multisig/MultisigDisabled/MultisigEnableStep2/MultisigEnableStep2';
import MultisigEnableStep3 from './../Session/SessionContent/Multisig/MultisigDisabled/MultisigEnableStep3/MultisigEnableStep3';
import MultisigDisableModal from './../Session/SessionContent/Multisig/MultisigEnabled/MultisigDisableModal/MultisigDisableModal';
import MultisigSetRequiredSigners from './../Session/SessionContent/Multisig/MultisigEnabled/MultisigSetRequiredSigners/MultisigSetRequiredSigners';
import SignWithLedgerModal from './LedgerModal/LedgerModal';
import TransactionDetails from './TransactionDetails/TransactionDetails';
import MultisigSubmitModal from './MultisigSubmitModal/MultisigSubmitModal';
import MultisigUnknownSubmitModal from './MultisigUnknownSubmitModal/MultisigUnknownSubmitModal';
import Sep7PayModal from './Sep7Modals/Sep7PayModal/Sep7PayModal';
import Sep6Modal from './Sep6Modal/Sep6Modal';
import Sep24Modal from './Sep24Modal/Sep24Modal';
import Sep7ErrorModal from './Sep7Modals/Sep7ErrorModal/Sep7ErrorModal';
import Sep7ChangeTrustModal from './Sep7Modals/Sep7ChangeTrustModal/Sep7ChangeTrustModal';
import EditOfferModal from './EditOfferModal/EditOfferModal';
import CancelOffersModal from './CancelOffersModal/CancelOffersModal';
import LoginModal from './LoginModal/LoginModal';
import SecretPhraseSetup from './SecretPhraseSetup/SecretPhraseSetup';
import BrowserModal from './BrowserModal/BrowserModal';
import MoonpayModal from './MoonpayModal/MoonpayModal';
import WalletConnectQRModal from './WalletConnectQRModal/WalletConnectQRModal';
import WalletConnectRequestModal from './WalletConnectRequestModal/WalletConnectRequestModal';
import WalletConnectPairingModal from './WalletConnectPairingModal/WalletConnectPairingModal';
import ChooseTransferServer from './ChooseTransferServer/ChooseTransferServer';
import ClaimableBalanceDetails from './ClaimableBalanceDetails/ClaimableBalanceDetails';
import WalletConnectSessionRequestModal from './WalletConnectSessionRequestModal/WalletConnectSessionRequestModal';
import SignChallengeWithMultisig from './SignChallengeWithMultisig/SignChallengeWithMultisig';
import SwapSettings from './SwapModals/SwapSettings/SwapSettings';
import SwapConfirm from './SwapModals/SwapConfirm/SwapConfirm';
import SwapSuccess from './SwapModals/SwapSuccess/SwapSuccess';

export default class GlobalModal extends React.Component {
    constructor(props) {
        super(props);
        this.unsub = this.props.d.modal.event.sub(() => {
            this.forceUpdate();

            if (this.props.d.modal.active) {
                document.documentElement.style.overflow = 'hidden';
            } else {
                document.documentElement.style.overflow = '';
            }
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

        switch (modal.modalName) {
            case 'sign': {
                let laboratoryContent;
                if (
                    d.session.account.inflation_destination ===
                    'GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW'
                ) {
                    laboratoryContent = (
                        <div className="GlobalModal__content">
                            <a
                                href={`https://www.stellar.org/laboratory/#txsigner?xdr=
                            ${encodeURI(modal.inputData.toEnvelope().toXDR('base64'))}&network=public`}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                            >
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
                            <TransactionDetails tx={modal.inputData} />
                        </div>
                        {laboratoryContent}
                        <div className="GlobalModal__navigation">
                            <button
                                className="s-btn_cancel"
                                onClick={() => {
                                    d.modal.handlers.cancel();
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="s-button"
                                onClick={() => {
                                    d.modal.handlers.finish();
                                }}
                            >
                                Sign
                            </button>
                        </div>
                    </div>
                );
                break;
            }
            case 'signWithLedger':
                body = <SignWithLedgerModal d={d} />;
                break;
            case 'multisig':
                body = <MultisigSubmitModal signer={modal.inputData} submit={d.modal.handlers} />;
                break;
            case 'multisigUnknown':
                body = <MultisigUnknownSubmitModal data={modal.inputData} submit={d.modal.handlers} />;
                break;
            case 'multisigEnableStep1':
                body = <MultisigEnableStep1 submit={d.modal.handlers} d={modal.inputData} />;
                break;
            case 'multisigEnableStep2':
                body = <MultisigEnableStep2 submit={d.modal.handlers} d={modal.inputData} />;
                break;
            case 'multisigEnableStep3':
                body = <MultisigEnableStep3 submit={d.modal.handlers} signerData={modal.inputData} d={d} />;
                break;
            case 'multisigDisableModal':
                body = <MultisigDisableModal submit={d.modal.handlers} signer={modal.inputData} d={d} />;
                break;
            case 'multisigSetRequiredSigners':
                body = <MultisigSetRequiredSigners submit={d.modal.handlers} d={d} />;
                break;
            case 'Sep7PayModal':
                body = <Sep7PayModal submit={d.modal.handlers} txDetails={modal.inputData} d={d} />;
                break;
            case 'Sep7TChangeTrustModal':
                body = <Sep7ChangeTrustModal submit={d.modal.handlers} txDetails={modal.inputData} d={d} />;
                break;
            case 'Sep7ErrorModal':
                body = <Sep7ErrorModal submit={d.modal.handlers} error={modal.inputData} />;
                break;
            case 'EditOfferModal':
                body = <EditOfferModal submit={d.modal.handlers} offerData={modal.inputData} d={d} />;
                break;
            case 'CancelOffersModal':
                body = <CancelOffersModal submit={d.modal.handlers} offersData={modal.inputData} d={d} />;
                break;
            case 'SecretPhraseSetup':
                body = <SecretPhraseSetup submit={d.modal.handlers} update={modal.inputData} d={d} />;
                break;
            case 'Sep6Modal':
                body = <Sep6Modal d={d} data={modal.inputData} />;
                break;
            case 'Sep24Modal':
                body = <Sep24Modal d={d} data={modal.inputData} />;
                break;
            case 'LoginModal':
                body = <LoginModal submit={d.modal.handlers} d={d} />;
                break;
            case 'BrowserModal':
                body = <BrowserModal submit={d.modal.handlers} d={d} />;
                break;
            case 'WalletConnectQRModal':
                body = <WalletConnectQRModal submit={d.modal.handlers} uri={modal.inputData} />;
                break;
            case 'WalletConnectPairingModal':
                body = <WalletConnectPairingModal submit={d.modal.handlers} data={modal.inputData} />;
                break;
            case 'WalletConnectRequestModal':
                body = <WalletConnectRequestModal submit={d.modal.handlers} data={modal.inputData} />;
                break;
            case 'WalletConnectSessionRequestModal':
                body = <WalletConnectSessionRequestModal submit={d.modal.handlers} data={modal.inputData} />;
                break;
            case 'MoonpayModal':
                body = <MoonpayModal submit={d.modal.handlers} d={d} quote={modal.inputData} />;
                break;
            case 'ChooseTransferServer':
                body = <ChooseTransferServer d={d} submit={d.modal.handlers} data={modal.inputData} />;
                break;
            case 'ClaimableBalanceDetails':
                body = <ClaimableBalanceDetails d={d} submit={d.modal.handlers} claimableBalance={modal.inputData} />;
                break;
            case 'SignChallengeWithMultisig':
                body = <SignChallengeWithMultisig d={d} submit={d.modal.handlers} data={modal.inputData} />;
                break;
            case 'SwapSettings':
                body = <SwapSettings d={d} submit={d.modal.handlers} />;
                break;
            case 'SwapConfirm':
                body = <SwapConfirm d={d} submit={d.modal.handlers} params={modal.inputData} />;
                break;
            case 'SwapSuccess':
                body = <SwapSuccess d={d} submit={d.modal.handlers} details={modal.inputData} />;
                break;
            default:
                body = (
                    <div className="GlobalModal">
                        <div className="GlobalModal__content">Error: missing modal {modal.modalName}</div>
                        <div className="GlobalModal__navigation">
                            <button
                                className="s-btn_cancel"
                                onClick={() => {
                                    d.modal.handlers.cancel();
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                );
                break;
        }

        return <div className={`GlobalModalBackdrop${d.modal.active ? '' : ' is-hidden'}`}>{body}</div>;
    }
}
GlobalModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
