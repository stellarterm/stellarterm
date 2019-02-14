import React from 'react';

export default function OfferError(errorType) {
    let error;

    switch (errorType) {
    case 'buy_not_authorized' :
        error = (
            <div className="s-alert s-alert--alert OfferMaker__message">
                Unable to create offer because the issuer has not authorized you to trade this asset. To fix
                this issue, check with the issuer{"'"}s website.
                <br />
                <br />
                NOTE: Some issuers are restrictive in who they authorize.
            </div>
        );
        break;
    case 'op_low_reserve':
        error = (
            <div className="s-alert s-alert--alert OfferMaker__message">
                Your account does not have enough XLM to meet the{' '}
                    <a
                        href="https://www.stellar.org/developers/guides/concepts/fees.html#minimum-account-balance"
                        target="_blank"
                        rel="nofollow noopener noreferrer">
                      minimum balance
                    </a>
                    . For more info, see <a href="#account">the minimum balance section</a> of the account page.
                    <br />
                    <br />
                    Solutions:
                    <ul className="OfferMaker__errorList">
                        <li>Send at least 1 XLM to your account</li>
                        <li>Cancel an existing an offer</li>
                        <li>
                          Decrease your minimum balance by <a href="#account/addTrust">unaccepting an asset</a>
                        </li>
                    </ul>
            </div>
        );
        break;
    case 'tx_bad_seq':
        error = (
            <div className="s-alert s-alert--alert OfferMaker__message">
                Transaction failed because sequence got out of sync. Please reload StellarTerm and try again.
            </div>
        );
        break;
    default:
        error = (
            <div className="s-alert s-alert--alert OfferMaker__message">
                Failed to create offer.
                <ul className="OfferMaker__errorList">
                    <li>Error code: {errorType}</li>
                </ul>
            </div>
        );
    }
    return error;
}
