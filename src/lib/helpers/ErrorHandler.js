function getErrorCode(error) {
    if (error.error) {
        return error.error;
    }
    if (!error.response) {
        return error.toString();
    }
    const { data } = error.response;
    if (!data) {
        return `clientError - ${error.message}`;
    }
    if (!data.extras || !data.extras.result_codes) {
        return `unknownResponse - ${error.message}`;
    }
    if (data.extras.result_codes.transaction === 'tx_failed') {
        return data.extras.result_codes.operations.find(op => op !== 'op_success');
    }
    return data.extras.result_codes.transaction;
}

const errorMap = new Map();
// 'OPERATION_NAME:(not required) + ERROR_CODE' - 'DESCRIPTION'
// TX errors: https://www.stellar.org/developers/guides/concepts/transactions.html
// OP errors: https://www.stellar.org/developers/guides/concepts/list-of-operations.html
errorMap
    // transaction errors
    .set('tx_too_early',
        'Ledger closeTime before minTime value in the transaction.')
    .set('tx_too_late',
        'Ledger closeTime after maxTime value in the transaction.')
    .set('tx_missing_operation',
        'No operation was specified.')
    .set('tx_bad_seq',
        'Transaction failed because sequence got out of sync. Please reload StellarTerm and try again.')
    .set('tx_bad_auth',
        'Too few valid signatures / wrong network.')
    .set('tx_insufficient_balance',
        'Fee would bring account below minimum reserve.')
    .set('tx_no_account',
        'Source account not found.')
    .set('tx_insufficient_fee',
        'Fee is too small.')
    .set('tx_bad_auth_extra',
        'Unused signatures attached to transaction.')
    .set('tx_internal_error',
        'An unknown error occurred.')
    // operation errors
    .set('op_low_reserve',
        'Your account does not have enough XLM to meet the minimum balance.')
    .set('payment:op_low_reserve',
        'The destination is a new non-activated account. A new account has to have at least 1 XLM.')
    .set('op_underfunded',
        'Transaction failed due to a lack of funds.')
    .set('op_malformed',
        'The input to the payment or the destination is invalid.')
    .set('op_already_exist',
        'The destination account already exists')
    .set('buy_not_authorized',
        'Unable to create offer because the issuer has not authorized you to trade this asset. ' +
        'To fix this issue, check with the issuers website.')
    .set('op_src_not_authorized',
        'The source account is not authorized to send this payment.')
    .set('op_no_destination',
        'The receiving account does not exist.')
    .set('op_line_full',
        'The destination account (receiver) does not have sufficient limits to receive amount and still ' +
        'satisfy its buying liabilities.')
    .set('op_no_trust',
        'Destination does not have a trust line.')
    .set('op_src_no_trust',
        'The source account does not trust the issuer of the asset it is trying to send.')
    .set('op_no_issuer',
        'The issuer of the asset does not exist.')
    .set('op_invalid_limit',
        'The limit is not sufficient to hold the current balance of the trustline and still satisfy ' +
        'its buying liabilities.')
    .set('op_self_not_allowed',
        'The source account attempted to create a trustline for itself, which is not allowed.')
    .set('op_too_few_offers',
        'There is no path of offers connecting the send asset and destination asset. ' +
        'Stellar only considers paths of length 5 or shorter.')
    .set('op_offer_cross_self',
        'The payment would cross one of its own offers.')
    .set('op_over_sendmax',
        'The paths that could send destination amount of destination asset would exceed send max.')
    .set('op_sell_no_trust',
        'The account creating the offer does not have a trustline for the asset it is selling.')
    .set('op_buy_no_trust',
        'The account creating the offer does not have a trustline for the asset it is buying.')
    .set('op_sell_not_authorized',
        'The account creating the offer is not authorized to buy this asset.')
    .set('op_buy_not_authorized',
        'The account creating the offer is not authorized to sell this asset.')
    .set('op_cross_self',
        'The account has opposite offer of equal or lesser price active, so the account creating this offer ' +
        'would immediately cross itself.')
    .set('op_sell_no_issuer',
        'The issuer of selling asset does not exist.')
    .set('op_buy_no_issuer',
        'The issuer of buying asset does not exist.')
    .set('op_offer_not_found',
        'An offer with some offerID cannot be found.')
    .set('op_too_many_signers',
        '20 is the maximum number of signers an account can have, and adding another signer would exceed that.')
    .set('op_bad_flags',
        'The flags set and/or cleared are invalid by themselves or in combination.')
    .set('op_invalid_inflation',
        'The destination account set in the inflation field does not exist.')
    .set('op_cant_change',
        'This account can no longer change the option it wants to change.')
    .set('op_unknown_flag',
        'The account is trying to set a flag that is unknown.')
    .set('op_threshold_out_of_range',
        'The value for a key weight or threshold is invalid.')
    .set('op_bad_signer',
        'Any additional signers added to the account cannot be the master key.')
    .set('op_invalid_home_domain',
        'Home domain is malformed.')
    .set('op_no_trust_line',
        'The trustor does not have a trustline with the issuer performing this operation.')
    .set('op_trust_not_required',
        'The source account (issuer performing this operation) does not require trust. ' +
        'In other words, it does not have the flag AUTH_REQUIRED_FLAG set.')
    .set('op_cant_revoke',
        'The source account is trying to revoke the trustline of the trustor, but it cannot do so.')
    .set('op_immutable_set',
        'The source account has AUTH_IMMUTABLE flag set.')
    .set('op_has_sub_entries',
        'The source account has trust lines/offers.')
    .set('op_seqnum_too_far',
        'Source’s account sequence number is too high. It must be less than (ledgerSeq << 32) = ' +
        '(ledgerSeq * 0x100000000). (protocol version 10 and above)')
    .set('op_dest_full',
        'The destination account cannot receive the balance of the source account and still satisfy its lumen ' +
        'buying liabilities. (protocol version 10 and above)')
    .set('op_not_time',
        'Inflation only runs once a week. This failure means it is not time for a new inflation round yet.')
    .set('op_not_supported_yet',
        'The network hasn’t moved to this protocol change yet. This failure means the network doesn’t support ' +
        'this feature yet.')
    .set('op_name_not_found',
        'Trying to remove a Data Entry that isn’t there. This will happen if Name is set (and Value isn’t) but ' +
        'the Account doesn’t have a DataEntry with that Name.')
    .set('op_invalid_name',
        'Name not a valid string.')
    .set('op_cannot_delete', 'Asset can’t be removed as you have an associated pool share')
    .set('op_bad_seq',
        'The specified bumpTo sequence number is not a valid sequence number. It must be between 0 ' +
        'and INT64_MAX (9223372036854775807 or 0x7fffffffffffffff).')
    .set('op_not_authorized', 'The destination account is not authorized to hold this asset.')
    .set('op_under_dest_min',
        'The paths that could send destination amount of destination asset would fall short of destination min.')
    .set('op_over_source_max',
        'The paths that could send destination amount of destination asset would exceed send max.');


export default function ErrorHandler(error, errorPrefix) {
    const errorCode = getErrorCode(error);

    if (errorPrefix && errorMap.has(`${errorPrefix}:${errorCode}`)) {
        return errorMap.get(`${errorPrefix}:${errorCode}`);
    }

    return errorMap.has(errorCode) ?
        errorMap.get(errorCode) :
        errorCode;
}
