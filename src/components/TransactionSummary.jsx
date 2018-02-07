const React = window.React = require('react');
import AssetCard2 from './AssetCard2.jsx';
import BigNumber from 'bignumber.js';

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
  let ops = [];
  let tx = props.tx;

  for (let i = 0; i < tx.operations.length; i++) {
    let op = tx.operations[i];
    let attributes = [];

    let label = operationsMap[op.type].label;
    if (op.type === 'changeTrust') {
      if (op['limit'] === '0') {
        label = 'Remove Asset';
      } else if (op['limit'] === '922337203685.4775807') {
        label = 'Accept Asset';
      }
    }

    if (op.type === 'manageOffer') {
      if (op['amount'] === '0') {
        label = 'Delete Offer';
      }
    }

    for (let attr in op) {
      let value = op[attr];
      if (attr === 'type') {
        // no-op
      } else if (attr === 'limit') {
        // No need to show limit
      } else {
        if (value !== undefined) {
          let displayValue;
          let hide = false;
          if (value.code !== undefined) {
            displayValue = <div className="TransactionSummary__row__content__inline__content__assetCard">
              <AssetCard2 code={value.code} issuer={value.issuer}></AssetCard2>
            </div>
          } else if (value === '922337203685.4775807') { // 2^63-1, the max number in Stellar, 64-bit fixed int
            displayValue = 'maximum'; // Hmm, is this even used anywhere?
          } else if (typeof value === 'string') {
            displayValue = value;
          } else {
            displayValue = <pre>{JSON.stringify(value, null, 2)}</pre>
          }

          let name;
          if (attr === 'line' || attr === 'asset') {
            // Don't show title for assets
          } else {
            name = attr;
          }

          if (op.type === 'manageOffer' && op['amount'] === '0') {
            if (attr === 'selling' || attr === 'buying' || attr === 'amount' || attr === 'price') {
              hide = true;
            }
          }

          if (!hide) {
            if (attr === 'asset') {
              // Push asset to the top
              attributes.unshift({
                key: attr,
                name: name,
                display: displayValue,
              })
            } else {
              attributes.push({
                key: attr,
                name: name,
                display: displayValue,
              })
            }
          }
        }
      }
    }

    ops.push(<div key={'table_op' + i} className="TransactionSummary__row">
      <div className="TransactionSummary__row__label">
        {label}
      </div>
      <div className="TransactionSummary__row__content">
        {attributes.map(attribute => {
          return <article key={attribute.key} className="TransactionSummary__row__content__inline">
            {attribute.name ? <p className="TransactionSummary__row__content__inline__title">{attribute.name}</p> : null}
            <div className="TransactionSummary__row__content__inline__content">{attribute.display}</div>
          </article>
        })}
      </div>
    </div>);
  }


  let memo;
  if (tx.memo._type === 'none') {
    memo = <em className="TransactionSummary__row__content__light">none</em>
  } else {
    memo = <article className="TransactionSummary__row__content__inline">
      <p className="TransactionSummary__row__content__inline__title">{tx.memo._type}</p>
      <div className="TransactionSummary__row__content__inline__content">{tx.memo._value}</div>
    </article>
  }

  return <div className="TransactionSummary">
    <div key="table_source" className="TransactionSummary__row TransactionSummary__row--first">
      <div className="TransactionSummary__row__label">
        Source
      </div>
      <div className="TransactionSummary__row__content">
        {tx.source}
      </div>
    </div>
    <div key="table_sequence" className="TransactionSummary__row">
      <div className="TransactionSummary__row__label">
        Sequence
      </div>
      <div className="TransactionSummary__row__content">
        {tx.sequence}
      </div>
    </div>
    {ops}
    <div key="table_fee" className="TransactionSummary__row">
      <div className="TransactionSummary__row__label">
        Network Fee
      </div>
      <div className="TransactionSummary__row__content">
        {new BigNumber(tx.fee).dividedBy(10000000).toString()} XLM <strong>{tx.fee <= 100 ? '(~$0.00)' : ''}</strong>
      </div>
    </div>
    <div key="table_memo" className="TransactionSummary__row">
      <div className="TransactionSummary__row__label">
        Memo
      </div>
      <div className="TransactionSummary__row__content">
        {memo}
      </div>
    </div>
  </div>
}



