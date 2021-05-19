import React from 'react';
import Printify from '../../lib/Printify';

const actionTypes = new Map([
    ['account_inflation_destination_updated', 'Inflation destination set'],
    ['signer_created', 'Signer added'],
    ['signer_updated', 'Signer updated'],
    ['signer_removed', 'Signer removed'],
    ['account_credited', 'Payment received'],
    ['account_debited', 'Payment sent'],
    ['trustline_created', 'Trustline created'],
    ['trustline_removed', 'Trustline removed'],
    ['trade', 'Trade completed'],
    ['account_thresholds_updated', 'Number of required signers updated'],
]);

const getPaymentBody = (op, titleText) => {
    const assetCode = op.asset_type === 'native' ? 'XLM' : op.asset_code;

    return (
        <React.Fragment>
            <div className="popup-title">{titleText}</div>
            <div className="popup-text">
                <div>Amount:</div>
                <div>
                    {Printify.lightenZeros(op.amount)}{' '}
                    <span>{assetCode}</span>
                </div>
            </div>
        </React.Fragment>
    );
};

const getTradeBody = (op, titleText) => {
    const tradePrice = (op.sold_amount / op.bought_amount).toFixed(7);
    const boughtCode = op.bought_asset_type === 'native' ? 'XLM' : op.bought_asset_code;
    const soldCode = op.sold_asset_type === 'native' ? 'XLM' : op.sold_asset_code;

    return (
        <React.Fragment>
            <div className="popup-title">{titleText}</div>
            <div className="popup-text">
                <div>Bought:</div>
                <div>{Printify.lightenZeros(op.bought_amount)}<span> {boughtCode}</span></div>
            </div>
            <div className="popup-text">
                <div>Sold:</div>
                <div>{Printify.lightenZeros(op.sold_amount)}<span> {soldCode}</span></div>
            </div>
            <div className="popup-text-bold">
                <div>Price:</div>
                <div>{tradePrice}</div>
            </div>
        </React.Fragment>
    );
};

const getTrustlineBody = (op, titleText) => (
    <React.Fragment>
        <div className="popup-title">{titleText}</div>
        <div className="popup-text">
            <div>Asset:</div>
            <div>{op.asset_code}</div>
        </div>
    </React.Fragment>
);

const getMultisigBody = (op, titleText) => (
    <React.Fragment>
        <div className="popup-title">Multisignature</div>
        <div className="popup-text">
            <div>{titleText}</div>
        </div>
    </React.Fragment>
);

// eslint-disable-next-line import/prefer-default-export
export const getOperationToastTemplate = op => {
    if (!actionTypes.has(op.type)) { return null; }

    const titleText = actionTypes.get(op.type);
    let opBody;

    switch (op.type) {
        case 'trade':
            opBody = getTradeBody(op, titleText);
            break;
        case 'account_inflation_destination_updated':
            opBody = <div className="popup-title">{titleText}</div>;
            break;
        case 'account_credited':
            opBody = getPaymentBody(op, titleText);
            break;
        case 'account_debited':
            opBody = getPaymentBody(op, titleText);
            break;
        case 'trustline_created':
            opBody = getTrustlineBody(op, titleText);
            break;
        case 'trustline_removed':
            opBody = getTrustlineBody(op, titleText);
            break;
        case 'signer_removed':
            opBody = getMultisigBody(op, titleText);
            break;
        case 'signer_created':
            opBody = getMultisigBody(op, titleText);
            break;
        case 'account_thresholds_updated':
            opBody = getMultisigBody(op, titleText);
            break;
        default:
            return null;
    }

    return opBody;
};

