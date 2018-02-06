const React = window.React = require('react');


// operationsMap is modified code from Stellar Laboratory licensed under Apache-2.0
// Interesting trivia: This was written by Iris Li in 2015 while at SDF
const operationsMap = {
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
    helpNote: 'Sends an amount in a specific asset to a destination account through a path of offers. This allows the asset sent (e.g., 450 XLM) to be different from the asset received (e.g, 6 BTC).',
    docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#path-payment',
  },
  manageOffer: {
    name: 'manageOffer',
    label: 'Manage Offer',
    helpNote: 'Creates, updates, or deletes an offer.',
    docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#manage-offer',
  },
  createPassiveOffer: {
    name: 'createPassiveOffer',
    label: 'Create Passive Offer',
    helpNote: 'Creates an offer that does not take another offer of equal price when created.',
    docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#create-passive-offer',
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
    helpNote: 'Transfers the native balance (the amount of XLM an account holds) to another account and removes the source account from the ledger.',
    docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#account-merge',
  },
  inflation: {
    name: 'inflation',
    label: 'Inflation',
    helpNote: 'Runs the weekly inflation',
    docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#inflation',
  },
  manageData: {
    name: 'manageData',
    label: 'Manage Data',
    helpNote: 'Sets, modifies, or deletes a Data Entry (name/value pair).',
    docsUrl: 'https://www.stellar.org/developers/learn/concepts/list-of-operations.html#manage-data',
  },
};

export default function TransactionSummary(props) {
  let rows = [];
  let tx = props.tx;

  for (let i = 0; i < tx.operations.length; i++) {
    let op = tx.operations[i];
    let attributes = [];

    for (let attr in op) {
      let value = op[attr];
      if (attr === 'type') {
        // no-op
      } else {
        if (value !== undefined) {
          attributes.push({
            name: attr,
            value: value,
          })
        }
      }
    }


    rows.push(<div key={'op' + i} className="TransactionSummary__row">
      <div className="TransactionSummary__row__label">
        {operationsMap[op.type].label}
      </div>
      <div className="TransactionSummary__row__content">
        {attributes.map(attribute => {
          return <div key={name} className="TransactionSummary__row__content__inline">
            <p className="TransactionSummary__row__content__inline__title">{attribute.name}</p>
            <p className="TransactionSummary__row__content__inline__content">{attribute.value}</p>
          </div>
        })}
      </div>
    </div>);
  }
  return <div className="TransactionSummary">
    <div key="source" className="TransactionSummary__row TransactionSummary__row--first">
      <div className="TransactionSummary__row__label">
        Source
      </div>
      <div className="TransactionSummary__row__content">
        {tx.source}
      </div>
    </div>
    <div key="sequence" className="TransactionSummary__row">
      <div className="TransactionSummary__row__label">
        Sequence
      </div>
      <div className="TransactionSummary__row__content">
        {tx.sequence}
      </div>
    </div>
    {rows}
  </div>
}



