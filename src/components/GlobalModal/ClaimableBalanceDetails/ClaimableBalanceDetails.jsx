/* eslint-disable camelcase */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import createStellarIdenticon from 'stellar-identicon-js';
import images from '../../../images';
import Driver from '../../../lib/Driver';
import { getNextClaimTime } from '../../../lib/claimableBalancesHelpers';
import { formatDate } from '../../Session/SessionContent/Activity/Activity';
import AssetCardInRow from '../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import ErrorHandler from '../../../lib/ErrorHandler';
import AppPopover from '../../Common/AppPopover/AppPopover';

const MOMENT_FORMAT = 'DD/MM/YYYY HH:mm';


const ClaimableBalanceDetails = ({ d, claimableBalance, submit }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { account, state } = d.session;
    const isActivatedAccount = state === 'in';

    const { accountId } = d.claimableBalances;

    const { amount, asset, sponsor, last_modified_time, claimants, id } = claimableBalance;

    const destination = claimants.find(claimant => claimant.destination === accountId);

    const { canClaim, isExpired, isConflict, status: type, claimEnd, claimStart } =
        getNextClaimTime(destination.predicate, Date.now());

    let predicatesTitle;
    let predicatesDescription;

    if (isConflict) {
        predicatesTitle = 'Conflicting claim conditions';
        predicatesDescription = 'The time conditions to claim this payment were set incorrectly by the sender. You can not claim this payment.';
    } else if (isExpired) {
        predicatesTitle = 'Claim conditions';
        predicatesDescription = 'This payment was not claimed within a time span set by the sender and has expired. You can no longer claim this payment.';
    } else {
        predicatesTitle = 'Claim conditions';
        predicatesDescription = 'You can claim this payment within a time span set by the sender. Once claimed, the tokens will be credited to your account balance.';
    }

    let availableTimeTitle;
    let availableTime;

    if (claimEnd && claimStart) {
        availableTimeTitle = 'Available to claim within';
        availableTime = `${claimStart.format(MOMENT_FORMAT)} - ${claimEnd.format(MOMENT_FORMAT)}`;
    } else if (claimEnd && !claimStart) {
        availableTimeTitle = 'Available to claim before';
        availableTime = claimEnd.format(MOMENT_FORMAT);
    } else if (!claimEnd && claimStart) {
        availableTimeTitle = 'Available to claim after';
        availableTime = claimStart.format(MOMENT_FORMAT);
    }

    const { time, date } = formatDate(last_modified_time);

    const canvas = createStellarIdenticon(sponsor);

    const renderedIcon = canvas.toDataURL();

    const viewAddress = sponsor && `${sponsor.substr(0, 18)}...${sponsor.substr(-12, 12)}`;

    const assetCode = asset === 'native' ? 'XLM' : asset.split(':')[0];
    const assetIssuer = asset === 'native' ? null : asset.split(':')[1];

    const assetInstance = new StellarSdk.Asset(assetCode, assetIssuer);

    const noTrustLine = isActivatedAccount ? account.getBalance(assetInstance) === null : false;

    const activeButtonText = noTrustLine ? 'Accept and Claim ' : 'Claim';

    const buttonText = isActivatedAccount ? activeButtonText : 'Activate account to claim';

    const claim = balanceId => {
        const isLedger = d.session.authType === 'ledger';
        if (isLedger) {
            submit.cancel();
        }
        setLoading(true);
        setError(null);
        d.session.handlers.claimClaimableBalance(balanceId, assetInstance, noTrustLine, isLedger)
            .then(({ serverResult, status }) => {
                if (status === 'await_signers') {
                    submit.cancel();
                    return null;
                }
                return serverResult;
            })
            .then(result => {
                if (!result) {
                    return;
                }
                d.toastService.success(
                    'Payment claimed',
                    `You’ve successfully claimed ${assetCode} tokens.`,
                );
                submit.cancel();
            })
            .catch(e => {
                const errorText = ErrorHandler(e);
                if (errorText === 'op_does_not_exist') {
                    d.toastService.error('Claim failed', 'The payment can no longer be claimed');
                    submit.cancel();
                    d.claimableBalances.getClaimableBalances();
                }
                setError(errorText);
                setLoading(false);
            });
    };

    return (
        <div className="ClaimableBalanceDetails">
            <div className="Modal_header">
                <span>Pending payment details</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        d.modal.handlers.cancel();
                    }}
                />
            </div>
            <div className="ClaimableBalanceDetails_content">
                <div className="ClaimableBalanceDetails_content-row">
                    <div className="ClaimableBalanceDetails_content-row-name">Status</div>
                    <div className="ClaimableBalanceDetails_content-row-content">{type}</div>
                </div>
                <div className="ClaimableBalanceDetails_content-row">
                    <div className="ClaimableBalanceDetails_content-row-name">Date received</div>
                    <div className="ClaimableBalanceDetails_content-row-content">{date} {time}</div>
                </div>
                <div className="ClaimableBalanceDetails_content-row">
                    <div className="ClaimableBalanceDetails_content-row-name">Received from</div>
                    <div className="ClaimableBalanceDetails_content-row-content">
                        <div className="ClaimableBalanceDetails_identicon">
                            <img src={renderedIcon} alt="id" />
                        </div>
                        {viewAddress}
                    </div>
                </div>
                <div className="ClaimableBalanceDetails_content-row">
                    <div className="ClaimableBalanceDetails_content-row-name">Asset</div>
                    <div className="ClaimableBalanceDetails_content-row-content">
                        <AssetCardInRow d={d} code={assetCode} issuer={assetIssuer} />
                        {noTrustLine &&
                        <AppPopover
                            hoverArea={
                                <div className="ClaimableBalanceDetails_no-trust">
                                    <img src={images['icon-warning-triangle']} alt="" />
                                    Not accepted
                                </div>
                            }
                            content={
                                <span>
                                    {`You’ll need to accept ${assetCode} asset to claim this pending payment.
                                    Make sure you have 0.5 XLM available on your balance.`}
                                </span>
                            }
                        />
                        }
                    </div>
                </div>
                <div className="ClaimableBalanceDetails_content-row">
                    <div className="ClaimableBalanceDetails_content-row-name">Amount</div>
                    <div className="ClaimableBalanceDetails_content-row-content">
                        {amount} {assetCode}
                    </div>
                </div>
                {(availableTimeTitle || isConflict) &&
                    <React.Fragment>
                        <div className="ClaimableBalanceDetails_content-row">
                            <div className="ClaimableBalanceDetails_content-row-name">{availableTimeTitle}</div>
                            <div className="ClaimableBalanceDetails_content-row-content">
                                {availableTime}
                            </div>
                        </div>
                        <div className="ClaimableBalanceDetails_predicates">
                            <div className="ClaimableBalanceDetails_predicates-title">
                                {predicatesTitle}
                            </div>
                            <div>{predicatesDescription}</div>
                        </div>
                    </React.Fragment>
                }
                {error &&
                    <div className="ErrorTransactionBlock">
                        <img src={images['icon-circle-fail']} alt="fail" />
                        <span>{error}</span>
                    </div>
                }
                <div className="Modal_button-block">
                    <button className="cancel-button" onClick={() => submit.cancel()}>
                        Cancel
                    </button>
                    <button
                        className={`s-button ${noTrustLine ? 'wide' : ''} ${!isActivatedAccount ? 'extra-wide' : ''}`}
                        onClick={() => { claim(id); }}
                        disabled={loading || !canClaim || !isActivatedAccount}
                    >
                        {buttonText}
                        {loading && <div className="nk-spinner" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClaimableBalanceDetails;

ClaimableBalanceDetails.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
    claimableBalance: PropTypes.objectOf(PropTypes.any),
};
