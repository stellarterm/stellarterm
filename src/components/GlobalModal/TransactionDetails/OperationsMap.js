export default {
    createAccount: {
        name: 'createAccount',
        label: 'Create Account',
        helpNote: 'Creates and funds a new account with the specified starting balance.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#create-account',
    },
    payment: {
        name: 'payment',
        label: 'Payment',
        helpNote: 'Sends an amount in a specific asset to a destination account.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#payment',
    },
    pathPaymentStrictSend: {
        name: 'pathPaymentStrictSend',
        label: 'Path payment strict send',
        helpNote:
            'A payment where the asset sent can be different than the asset received; allows the user to specify the amount of the asset to send',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#path-payment-strict-send',
    },
    pathPaymentStrictReceive: {
        name: 'pathPaymentStrictReceive',
        label: 'Path payment strict receive',
        helpNote:
            'A payment where the asset received can be different from the asset sent; allows the user to specify the amount of the asset received',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#path-payment-strict-receive',
    },
    manageOffer: {
        name: 'manageOffer',
        label: 'Manage Offer',
        helpNote: 'Creates, updates, or deletes an offer.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#manage-sell-offer',
    },
    manageBuyOffer: {
        name: 'manageBuyOffer',
        label: 'Manage Buy Offer',
        helpNote: 'Creates, updates, or deletes an offer.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#manage-buy-offer',
    },
    manageSellOffer: {
        name: 'manageSellOffer',
        label: 'Manage Sell Offer',
        helpNote: 'Creates, updates, or deletes an offer.',
        docsUrl: 'https://www.stellar.org/developers/guides/concepts/list-of-operations.html#manage-sell-offer',
    },
    createPassiveOffer: {
        name: 'createPassiveOffer',
        label: 'Create Passive Offer',
        helpNote: 'Creates an offer that does not take another offer of equal price when created.',
        docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#create-passive-offer',
    },
    createPassiveSellOffer: {
        name: 'createPassiveSellOffer',
        label: 'Create Passive Sell Offer',
        helpNote: 'Creates an offer that does not take another offer of equal price when created.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#create-passive-sell-offer',
    },
    setOptions: {
        name: 'setOptions',
        label: 'Set Options',
        helpNote: 'Sets various configuration options for an account.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#set-options',
    },
    changeTrust: {
        name: 'changeTrust',
        label: 'Change Trust',
        helpNote: 'Creates, updates, or deletes a trustline.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#change-trust',
    },
    allowTrust: {
        name: 'allowTrust',
        label: 'Allow Trust',
        helpNote: 'Updates the authorized flag of an existing trustline.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#allow-trust',
    },
    accountMerge: {
        name: 'accountMerge',
        label: 'Account Merge',
        helpNote:
            'Transfers the native balance (the amount of XLM an account holds) to another account and removes the source account from the ledger.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#allow-trust',
    },
    manageData: {
        name: 'manageData',
        label: 'Manage Data',
        helpNote: 'Sets, modifies, or deletes a Data Entry (name/value pair).',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#manage-data',
    },
    claimClaimableBalance: {
        name: 'claimClaimableBalance',
        label: 'Claim Claimable Balance',
        helpNote: 'Claims a ClaimableBalanceEntry and adds the amount of asset on the entry to the source account.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#claim-claimable-balance',
    },
    bumpSequence: {
        name: 'bumpSequence',
        label: 'Bump Sequence',
        helpNote: 'Bumps forward the sequence number of the source account to the given sequence number.',
        docsUrl: 'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations#bump-sequence',
    },
};
