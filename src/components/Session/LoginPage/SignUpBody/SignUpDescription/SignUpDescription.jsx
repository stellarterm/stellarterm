import React from 'react';

export default () => (
    <React.Fragment>
        <h3>Create Account Keypair</h3>
        <p>
            To get started on using the Stellar network, you must first create a keypair (unless you have a Ledger
            Nano). The keypair consists of two parts:
        </p>
        <ul className="LoginPage__form__list">
            <li>
                <strong>Public key</strong>: The public key is used to identify the account. It is also known as an
                account. This public key is used for receiving funds.
            </li>
            <li>
                <strong>Secret key</strong>: The secret key is used to access your account and make transactions. Keep
                this code safe and secure. Anyone with the code will have full access to the account and funds. If you
                lose the key, you will no longer be able to access the funds and there is no recovery mechanism.
            </li>
        </ul>
    </React.Fragment>
);
