export const mapShortStatus = status => {
    switch (status) {
        case 'incomplete':
            return 'Incomplete';

        case 'pending_external':
        case 'pending_anchor':
        case 'pending_stellar':
            return 'In Progress';

        case 'too_large':
        case 'too_small':
        case 'no_market':
        case 'error':
            return 'Error';

        case 'pending_user_transfer_start':
        case 'pending_trust':
        case 'pending_user':
        case 'pending_customer_info_update':
        case 'pending_transaction_info_update':
        case 'pending_user_transfer_complete':
            return 'User Action Required';

        case 'completed':
            return 'Сompleted';

        default:
            return status.replace(/_/g, ' ');
    }
};

export const mapStatusIcon = status => {
    switch (status) {
        case 'incomplete':
            return 'icons-status-incomplete';

        case 'pending_external':
        case 'pending_anchor':
        case 'pending_stellar':
            return 'icons-status-in-progress';

        case 'too_large':
        case 'too_small':
        case 'no_market':
        case 'error':
            return 'icons-status-error';

        case 'pending_user_transfer_start':
        case 'pending_trust':
        case 'pending_user':
        case 'pending_customer_info_update':
        case 'pending_transaction_info_update':
        case 'pending_user_transfer_complete':
            return 'icons-status-action';

        case 'completed':
            return 'icons-status-completed';

        case 'refunded':
            return 'icons-status-refunded';

        case 'expired':
            return 'icons-status-expired';

        default:
            return null;
    }
};

const textDepositCompleted = 'Deposit fully completed';
const textDepositPendingExternal = 'Deposit is being processed on external network or bank system';
const textDepositPendingCustomerInfoUpdate = 'Certain pieces of information need to be updated by the user to proceed with deposit';
const textDepositPendingTransactionInfoUpdate = 'Certain pieces of information need to be updated by the user to proceed with deposit';
const textDepositPendingAnchor = 'Deposit is being processed by the anchor';
const textDepositPendingStellar = 'Stellar network is executing the transaction';
const textDepositPendingTrust = 'Add the asset to your account to proceed with deposit';
const textDepositPendingUser = 'Anchor is waiting on users additional action to proceed with deposit';
const textDepositPendingUserTransferStart = 'Transfer the funds to the anchor to continue with your deposit';
const textDepositPendingUserTransferComplete = 'User needs to take additional action to complete the deposit';
const textDepositIncomplete = 'Not enough info to initiate the deposit. \nPlease start another transaction';
const textDepositNoMarket = 'No market available to proceed with deposit. \nContact anchor for details';
const textDepositTooSmall = 'The transferred amount is less than the minimum for deposit. \nContact anchor for details';
const textDepositTooLarge = 'The transferred amount exceeds the maximum for deposit. \nContact anchor for details';
const textDepositError = 'Deposit can\'t be completed due to an error. \nContact anchor for details';
const textDepositRefunded = 'Deposit refunded by the anchor';
const textDepositExpired = 'Transaction has expired and is no longer updated. \nPlease start another deposit transaction';

const textWithdrawCompleted = 'Withdrawal fully completed';
const textWithdrawPendingExternal = 'Withdrawal is being processed on external network or bank system';
const textWithdrawPendingCustomerInfoUpdate = 'Certain pieces of information need to be updated by the user to proceed with withdrawal';
const textWithdrawPendingTransactionInfoUpdate = 'Certain pieces of information need to be updated by the user to proceed with withdrawal';
const textWithdrawPendingAnchor = 'Withdrawal is being processed by the anchor';
const textWithdrawPendingStellar = 'Stellar network is executing the transaction';
const textWithdrawPendingUser = 'Anchor is waiting on users additional action to proceed with withdrawal';
const textWithdrawPendingUserTransferStart = 'Anchor waiting on you to transfer the funds. \nUse the \'Withdraw\' button below to initiate the withdrawal';
const textWithdrawPendingUserTransferComplete = 'Your cash is available for in-person pick up. \nSelect the \'More Info\' option on the right to view the details';
const textWithdrawIncomplete = 'Not enough info to initiate the withdrawal. \nPlease start another transaction';
const textWithdrawNoMarket = 'No market available to proceed with withdrawal. \nContact anchor for details';
const textWithdrawTooSmall = 'The transferred amount is less than the minimum for withdrawal. \nContact anchor for details';
const textWithdrawTooLarge = 'The transferred amount exceeds the maximum for withdrawal. \nContact anchor for details';
const textWithdrawError = 'Withdrawal can\'t be completed due to an error. \nContact anchor for details';
const textWithdrawRefunded = 'Withdrawal refunded to your account by the anchor';
const textWithdrawExpired = 'Transaction has expired and is no longer updated. \nPlease start another withdrawal transaction';
const textWithdrawAwaitAnchor = 'Withdrawal transaction successfully initiated or sent to your multisig service for confirmation';

export const mapStatus = (status, isDeposit) => {
    switch (status) {
        case 'completed':
            return isDeposit ? textDepositCompleted : textWithdrawCompleted;
        case 'pending_external':
            return isDeposit ? textDepositPendingExternal : textWithdrawPendingExternal;
        case 'pending_anchor':
            return isDeposit ? textDepositPendingAnchor : textWithdrawPendingAnchor;
        case 'pending_stellar':
            return isDeposit ? textDepositPendingStellar : textWithdrawPendingStellar;
        case 'pending_trust':
            return textDepositPendingTrust;
        case 'pending_user':
            return isDeposit ? textDepositPendingUser : textWithdrawPendingUser;
        case 'pending_user_transfer_start':
            return isDeposit ? textDepositPendingUserTransferStart : textWithdrawPendingUserTransferStart;
        case 'pending_customer_info_update':
            return isDeposit ? textDepositPendingCustomerInfoUpdate : textWithdrawPendingCustomerInfoUpdate;
        case 'pending_transaction_info_update':
            return isDeposit ? textDepositPendingTransactionInfoUpdate : textWithdrawPendingTransactionInfoUpdate;
        case 'incomplete':
            return isDeposit ? textDepositIncomplete : textWithdrawIncomplete;
        case 'no_market':
            return isDeposit ? textDepositNoMarket : textWithdrawNoMarket;
        case 'pending_user_transfer_complete':
            return isDeposit ? textDepositPendingUserTransferComplete : textWithdrawPendingUserTransferComplete;
        case 'too_small':
            return isDeposit ? textDepositTooSmall : textWithdrawTooSmall;
        case 'too_large':
            return isDeposit ? textDepositTooLarge : textWithdrawTooLarge;
        case 'error':
            return isDeposit ? textDepositError : textWithdrawError;
        case 'refunded':
            return isDeposit ? textDepositRefunded : textWithdrawRefunded;
        case 'expired':
            return isDeposit ? textDepositExpired : textWithdrawExpired;
        case 'await_anchor':
            return textWithdrawAwaitAnchor;
        default:
            return status.replace(/_/g, ' ');
    }
};

const SEP24_CACHE_ALIAS = 'sent_sep24_transactions';

export const hasIdInCache = id => {
    const transactionIdList = JSON.parse(localStorage.getItem(SEP24_CACHE_ALIAS) || '[]');

    return transactionIdList.includes(id);
};


export const addIdToCache = id => {
    const transactionIdList = JSON.parse(localStorage.getItem(SEP24_CACHE_ALIAS) || '[]');

    transactionIdList.push(id);

    localStorage.setItem(SEP24_CACHE_ALIAS, JSON.stringify(transactionIdList));
};

export const removeIdFromCache = id => {
    if (!hasIdInCache(id)) {
        return;
    }
    const transactionIdList = JSON.parse(localStorage.getItem(SEP24_CACHE_ALIAS) || '[]');

    const updatedIdList = transactionIdList.filter(item => item !== id);

    localStorage.setItem(SEP24_CACHE_ALIAS, JSON.stringify(updatedIdList));
};
