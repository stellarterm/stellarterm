import PropTypes from 'prop-types';
import { isStellarUri, parseStellarUri } from '@stellarguard/stellar-uri';
import Driver from '../../../lib/Driver';


export default function Sep7Handler(props) {
    // Supported browsers: Opera, Chrome, Firefox

    if (!window.navigator.registerProtocolHandler) {
        console.warn('Your browser does not support the Stellar-protocol: SEP-0007. ' +
            'Use Chrome, Opera or Firefox to open web+stellar links');
        return;
    }

    // Enable stellarUri in browser
    window.navigator.registerProtocolHandler('web+stellar', `${window.location.origin}?tx=%s`, 'stellarUri');

    // Check is StellarUri
    const urlParsed = [...new window.URLSearchParams(window.location.search).entries()].reduce((sum, [key, val]) =>
            Object.assign({ [key]: val }, sum), {}) || {};
    if (!isStellarUri(urlParsed.tx)) {
        return;
    }

    const { driver } = props;

    // Supported:
    // 1) Payment transactions with amount (donate is not supported now)
    // 2) TX transactions (payment and changeTrust)


    const txDetails = parseStellarUri(urlParsed.tx);
    const { operation } = txDetails;
    txDetails.verifySignature()
        .then((isVerified) => {
            if (!isVerified) {
                driver.modal.handlers.activate('Sep7ErrorModal',
                    'Security warning: signature of this transaction request is not valid!');
            } else {
                if (operation === 'pay') {
                    if (txDetails.amount) {
                        driver.modal.handlers.activate('Sep7PayModal', txDetails);
                    } else {
                        driver.modal.handlers.activate('Sep7ErrorModal',
                            'Payment operations without specified amount are not supported yet');
                    }
                    return;
                }
                try {
                    const { xdr } = txDetails;
                    const transaction = new StellarSdk.Transaction(xdr);

                    if (transaction.operations.length !== 1) {
                        driver.modal.handlers.activate('Sep7ErrorModal', 'Transactions with multiple operations are not supported yet');
                        return;
                    }
                    if (transaction.operations[0].type === 'payment') {
                        driver.modal.handlers.activate('Sep7PayModal', txDetails);
                        return;
                    }
                    if (transaction.operations[0].type === 'changeTrust') {
                        driver.modal.handlers.activate('Sep7TChangeTrustModal', txDetails);
                        return;
                    }
                    driver.modal.handlers.activate('Sep7ErrorModal', 'This type of operation is not currently supported');
                } catch (e) {
                    driver.modal.handlers.activate('Sep7ErrorModal', 'Error: Could not parse transaction request URI!');
                }
            }
        });
}
Sep7Handler.propTypes = {
    driver: PropTypes.instanceOf(Driver).isRequired,
};
