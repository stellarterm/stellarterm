import PropTypes from 'prop-types';
import { isStellarUri, parseStellarUri } from '@stellarguard/stellar-uri';
import { HOME_URL } from '../../../env-consts';
import Driver from '../../../lib/Driver';


export default function Sep7Handler(props) {
    // Enable stellarUri in browser
    window.navigator.registerProtocolHandler('web+stellar', `${HOME_URL}?tx=%s`, 'stellarUri');

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

    try {
        const txDetails = parseStellarUri(urlParsed.tx);
        const { operation } = txDetails;
        txDetails.verifySignature()
            .then((isVerified) => {
                if (!isVerified) {
                    driver.modal.handlers.activate('Sep7ErrorModal',
                        'Signatures of transaction is not verified!');
                } else {
                    if (operation === 'pay') {
                        if (txDetails.amount) {
                            driver.modal.handlers.activate('Sep7PayModal', txDetails);
                        } else {
                            driver.modal.handlers.activate('Sep7ErrorModal',
                                'Payment operations without amount is not supported now!');
                        }
                        return;
                    }

                    const transaction = new StellarSdk.Transaction(txDetails.xdr);
                    if (transaction.operations.length !== 1) {
                        driver.modal.handlers.activate('Sep7ErrorModal', 'Multiply operations is not supported now!');
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
                    driver.modal.handlers.activate('Sep7ErrorModal', 'Unsupported operation!');
                }
            });
    } catch (e) {
        driver.modal.handlers.activate('Sep7ErrorModal', 'Wrong transaction uri!');
    }
}
Sep7Handler.propTypes = {
    driver: PropTypes.instanceOf(Driver).isRequired,
};
