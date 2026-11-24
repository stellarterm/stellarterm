import TrezorConnect from '@trezor/connect-web';

let initialization;

export default function initializeTrezor() {
    if (!initialization) {
        initialization = TrezorConnect.init({
            manifest: {
                appName: 'StellarTerm',
                email: 'support@stellarterm.com',
                appUrl: 'https://stellarterm.com',
            },
        }).catch(error => {
            initialization = null;
            throw error;
        });
    }
    return initialization;
}
