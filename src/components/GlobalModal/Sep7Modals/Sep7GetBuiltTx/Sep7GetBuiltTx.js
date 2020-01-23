import * as StellarSdk from 'stellar-sdk';
import BigNumber from 'bignumber.js';
import { TransactionStellarUri } from '@stellarguard/stellar-uri';

function getTransactionWithReplacedAccountData(transactionStellarUri, d) {
    transactionStellarUri.addReplacement({
        id: 'SRC',
        path: 'sourceAccount',
        hint: 'source account',
    });
    transactionStellarUri.addReplacement({
        id: 'SEQ',
        path: 'seqNum',
        hint: 'sequence number',
    });
    const { account } = d.session;
    account.incrementSequenceNumber();
    return transactionStellarUri.replace({
        SRC: account.account_id,
        SEQ: new BigNumber(account.sequence),
    }).getTransaction();
}

export default async function Sep7GetBuiltTx(txDetails, d) {
    const { xdr } = txDetails;
    const replacements = txDetails.getReplacements();
    const transaction = new StellarSdk.Transaction(xdr);
    const transactionStellarUri = TransactionStellarUri.forTransaction(transaction);
    if (!replacements.length) {
        if (transaction.source === 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF' ||
            transaction.source === 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7') {
            return getTransactionWithReplacedAccountData(transactionStellarUri, d);
        }

        if (transaction.sequence === '0') {
            try {
                const account = await d.Server.loadAccount(transaction.source);
                transactionStellarUri.addReplacement({
                    id: 'SEQ',
                    path: 'seqNum',
                    hint: 'sequence number',
                });
                return transactionStellarUri.replace({
                    SEQ: new BigNumber(account.sequence).plus(1),
                }).getTransaction();
            } catch (e) {
                console.log(e);
                throw new Error('Error loading the sequence number for source account');
            }
        }
        return transaction;
    }

    //  Checks of "replace fields" are duplicated in the Sep7Handler.jsx

    if (replacements.length > 1 || replacements[0].path !== 'sourceAccount') {
        throw new Error('Replace fields are not currently supported');
    }
    return getTransactionWithReplacedAccountData(transactionStellarUri, d);
}
