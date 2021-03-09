export default {
    createAccount: {
        name: 'createAccount',
        label: 'Create Account',
        helpNote: 'Creates and funds a new account with the specified starting balance.',
        docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#create-account',
    },
    payment: {
        name: 'payment',
        label: 'Payment',
        helpNote: 'Sends an amount in a specific asset to a destination account.',
        docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#payment',
    },
    pathPayment: {
        name: 'pathPayment',
        label: 'Path Payment',
        helpNote:
            'Sends an amount in a specific asset to a destination account through a path of offers. This allows the asset sent (e.g., 450 XLM) to be different from the asset received (e.g, 6 BTC).',
        docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#path-payment',
    },
    manageOffer: {
        name: 'manageOffer',
        label: 'Manage Offer',
        helpNote: 'Creates, updates, or deletes an offer.',
        docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#manage-offer',
    },
    manageBuyOffer: {
        name: 'manageBuyOffer',
        label: 'Manage Buy Offer',
        helpNote: 'Creates, updates, or deletes an offer.',
        docsUrl: 'https://www.stellar.org/developers/guides/concepts/list-of-operations.html#manage-buy-offer',
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
        docsUrl: 'https://www.stellar.org/developers/guides/concepts/list-of-operations.html#create-passive-sell-offer',
    },
    setOptions: {
        name: 'setOptions',
        label: 'Set Options',
        helpNote: 'Sets various configuration options for an account.',
        docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#set-options',
    },
    changeTrust: {
        name: 'changeTrust',
        label: 'Change Trust',
        helpNote: 'Creates, updates, or deletes a trustline.',
        docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#change-trust',
    },
    allowTrust: {
        name: 'allowTrust',
        label: 'Allow Trust',
        helpNote: 'Updates the authorized flag of an existing trustline.',
        docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#allow-trust',
    },
    accountMerge: {
        name: 'accountMerge',
        label: 'Account Merge',
        helpNote:
            'Transfers the native balance (the amount of XLM an account holds) to another account and removes the source account from the ledger.',
        docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#account-merge',
    },
    manageData: {
        name: 'manageData',
        label: 'Manage Data',
        helpNote: 'Sets, modifies, or deletes a Data Entry (name/value pair).',
        docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#manage-data',
    },
};
