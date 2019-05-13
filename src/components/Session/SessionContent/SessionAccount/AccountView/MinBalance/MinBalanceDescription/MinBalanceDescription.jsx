import React from 'react';

export default () => (
    <div className="island__sub__division MinBalance__sub">
        <p>
            The Stellar network requires accounts to maintain a{' '}
            <a
                href="https://www.stellar.org/developers/guides/concepts/fees.html#minimum-account-balance"
                target="_blank"
                rel="noopener noreferrer">
                minimum balance
            </a>
            . A 1 XLM minimum balance is required with an additional requirement 0.5 XLM for each entry in the account
            such as a trustline or offer. You can read more about this on the{' '}
            <a
                href="https://www.stellar.org/developers/guides/concepts/fees.html#minimum-account-balance"
                target="_blank"
                rel="noopener noreferrer">
                Stellar developer docs
            </a>
        </p>
        <p>
            Each entry (asset accepted, offer, signer) increases your minimum balance by 0.5 XLM. Additionally,
            StellarTerm enforces a 0.5 XLM of extra minimum balance in an attempt to make sure your account can still
            make transactions without going below the network minimum balance requirements.
        </p>
        <p>
            <strong>To decrease your minimum balance</strong>, you can remove an existing offer or{' '}
            <a href="#account/addTrust">unaccept an asset</a>.<br />
            If you would like to close your Stellar account and withdraw assets somewhere else you can use{' '}
            <a href="https://merge.lobstr.co/" target="_blank" rel="noopener noreferrer">
                Account Merge tool
            </a>
            .
        </p>
    </div>
);
