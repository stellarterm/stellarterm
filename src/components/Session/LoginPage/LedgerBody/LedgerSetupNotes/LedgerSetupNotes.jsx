import React from 'react';

export default () => (
    <div className="LoginPage_notes">
        <span className="LoginPage_notes-title">Notes</span>
        <ul>
            <li>Ledger Nano S support is available on Chrome and Opera.</li>
            <li>
                Choose the BIP32 path of the account you want use: {"44'/148'/n'"} where n is the account index. Or use
                the default account {"44'/148'/0'"}.
            </li>
        </ul>
    </div>
);
