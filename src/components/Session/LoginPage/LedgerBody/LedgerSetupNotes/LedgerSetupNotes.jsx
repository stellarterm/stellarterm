import React from 'react';

export default () => (
    <div className="LoginPage__paddedBox">
        <h3>Notes</h3>
        <ul>
            <li>Ledger Nano S support is available on Chrome and Opera.</li>

            <li>
                Install the Stellar app with the{' '}
                <a href="https://www.ledgerwallet.com/apps/manager" target="_blank" rel="nofollow noopener noreferrer">
                    Ledger Manager
                </a>
                .
            </li>

            <li>Enable browser support in the app settings.</li>

            <li>
                Choose the BIP32 path of the account you want use: {"44'/148'/n'"} where n is the account index. Or use
                the default account {"44'/148'/0'"}.
            </li>
        </ul>
    </div>
);
