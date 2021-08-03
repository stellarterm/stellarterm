import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import QRCode from 'qrcode.react';
import SessionAccountMenu from '../SessionContent/SessionAccountMenu/SessionAccountMenu';
import ErrorBoundary from '../../Common/ErrorBoundary/ErrorBoundary';
import clickToSelect from '../../../lib/clickToSelect';
import CopyButton from '../../Common/CopyButton/CopyButton';
import Driver from '../../../lib/Driver';
import images from '../../../images';
import ActivityPendingPaymentsHistory from '../SessionContent/PendingPayments/ActivePendingPayments/ActivePendingPayments';

export default function SessionActivate(props) {
    useEffect(() => {
        props.d.claimableBalances.getClaimableBalances();
    }, []);

    const { unfundedAccountId } = props;
    const hasClaimableBalances = Boolean(props.d.claimableBalances.pendingClaimableBalances.length);

    if (props.d.Server.isTestnet) {
        return (
            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <div className="testnet-unfunded">
                        <div className="titleDesc">Account activation required</div>
                        <a
                            href="https://www.stellar.org/laboratory/#account-creator?network=test"
                            className="s-button"
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                        >
                            Use the Friendbot to get some test lumens
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <Redirect to={'/account/'} />
            <SessionAccountMenu d={props.d} onlyLogoutNav />

            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <div className="activate_Description">
                        <div className="titleDesc">Account activation required</div>
                        <p className="noMargin-p">
                            To use your Stellar account, you must activate it by sending at least{' '}
                            <span className="markedBold">5 lumens (XLM)</span> to your account. <br />
                            You can buy lumens (XLM) from an exchange and send them to your address.
                        </p>
                    </div>

                    <div className="activate_Instruction">
                        <div className="card_container">
                            <p className="titleDesc">Send from another wallet</p>
                            <div className="green_card pubKey_Block">
                                <QRCode value={unfundedAccountId} size={110} renderAs="svg" />

                                <div className="AccountIdBlock_content">
                                    <p>Your Wallet Account ID</p>
                                    <strong onClick={clickToSelect}>{unfundedAccountId}</strong>
                                </div>

                                <CopyButton text={unfundedAccountId} btnText={'COPY ADDRESS'} />
                            </div>
                        </div>

                        <div className="card_container">
                            <p className="titleDesc">Buy lumens with VISA or Mastercard</p>
                            <div className="green_card">
                                <div className="buyXLM_block">
                                    <div className="block_container">
                                        <img src={images['icon-fastClock']} alt="fast" />
                                    </div>

                                    <div className="block_container">
                                        <div className="buyTitle">Fast & Easy</div>
                                        <div className="buyDesc">
                                            Lumens reach your account in 10-30 minutes on average
                                        </div>
                                    </div>
                                </div>
                                <div className="buyXLM_block">
                                    <div className="block_container">
                                        <img src={images['icon-lock']} alt="fast" />
                                    </div>

                                    <div className="block_container">
                                        <div className="buyTitle">Secure</div>
                                        <div className="buyDesc">
                                            Payment processor complies with PCI SAQ when storing, processing and
                                            transmitting cardholder data
                                        </div>
                                    </div>
                                </div>
                                <div className="buyXLM_block">
                                    <div className="block_container">
                                        <img src={images['icon-circle-success']} alt="fast" />
                                    </div>

                                    <div className="block_container">
                                        <div className="buyTitle">Convenient</div>
                                        <div className="buyDesc">
                                            Deposit XLM to your account using Visa or MasterCard credit card
                                        </div>
                                    </div>
                                </div>

                                <Link className="s-button" to="/buy-crypto?code=xlm">
                                    Buy XLM
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {hasClaimableBalances &&
                <div className="island Activity no_top_margin">
                    <ActivityPendingPaymentsHistory d={props.d} />
                </div>
            }

        </ErrorBoundary>
    );
}

SessionActivate.propTypes = {
    unfundedAccountId: PropTypes.string.isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
};
