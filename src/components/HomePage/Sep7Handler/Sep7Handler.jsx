import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import { isStellarUri, parseStellarUri } from '@stellarguard/stellar-uri';
import Driver from '../../../lib/Driver';


function checkReplaceFields(replacements, driver) {
    // Checks of "replace fields"  are duplicated in the Sep7GetBuiltTX

    // Supported:
    // Transactions with 'sourceAccount' field in replace
    // Without replace

    if (replacements.length > 1) {
        driver.modal.handlers.activate('Sep7ErrorModal',
            'Transactions with multiple replacements are not currently supported');
        return false;
    }

    if (replacements.length && replacements[0].path !== 'sourceAccount') {
        driver.modal.handlers.activate('Sep7ErrorModal',
            `Field: "${replacements[0].path}" in replacement is not currently supported`);
        return false;
    }

    return true;
}

function processOperations(operations, driver, txDetails) {
    // Supported:
    // Payment transactions with amount (donate is not supported now)
    // TX transactions (payment and changeTrust)

    if (operations.length !== 1) {
        driver.modal.handlers.activate('Sep7ErrorModal',
            'Transactions with multiple operations are not supported yet');
        return;
    }
    const { type } = operations[0];

    if (type === 'payment') {
        driver.modal.handlers.activate('Sep7PayModal', txDetails);
        return;
    }

    if (type === 'changeTrust') {
        driver.modal.handlers.activate('Sep7TChangeTrustModal', txDetails);
        return;
    }

    driver.modal.handlers.activate('Sep7ErrorModal',
        'This type of operation is not currently supported');
}


export default function Sep7Handler(driver) {
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

    const txDetails = parseStellarUri(urlParsed.tx);
    const { operation } = txDetails;
    txDetails.verifySignature()
        .then((isVerified) => {
            if (!isVerified) {
                driver.modal.handlers.activate('Sep7ErrorModal',
                    'Security warning: signature of this transaction request is not valid!');
                return;
            }

            const isPayOperation = operation === 'pay';
            if (isPayOperation && !txDetails.amount) {
                driver.modal.handlers.activate('Sep7ErrorModal',
                    'Payment operations without specified amount are not supported yet');
                return;
            }

            if (isPayOperation) {
                driver.modal.handlers.activate('Sep7PayModal', txDetails);
                return;
            }

            try {
                const { xdr } = txDetails;
                const replacements = txDetails.getReplacements();
                const transaction = new StellarSdk.Transaction(xdr, driver.Server.networkPassphrase);

                if (!checkReplaceFields(replacements, driver)) {
                    return;
                }

                const { operations } = transaction;
                processOperations(operations, driver, txDetails);
            } catch (e) {
                driver.modal.handlers.activate('Sep7ErrorModal',
                    'Error: Could not parse transaction request URI!');
            }
        });
}
Sep7Handler.propTypes = {
    driver: PropTypes.instanceOf(Driver).isRequired,
};
