import React from 'react';
import PropTypes from 'prop-types';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../../../lib/Driver';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import { AUTH_TYPE } from '../../../../../lib/constants';
import images from '../../../../../images';

export default class SendReview extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPending: false,
        };
    }

    onClickSubmit() {
        this.setState({ isPending: true });
        const { availableAssets, choosenSlug } = this.props.d.send;
        const isDestAcceptAsset = availableAssets[choosenSlug].sendable;
        this.props.d.send.submitSendTransaction(!isDestAcceptAsset);
    }

    render() {
        const {
            state,
            accountId,
            memoType,
            memoContent,
            assetToSend,
            amountToSend,
            clickBackToSend,
            federationAddress,
            availableAssets,
            choosenSlug,
        } = this.props.d.send;

        const { isPending } = this.state;

        const identiconImg = createStellarIdenticon(accountId).toDataURL();
        const memoTitle = memoType.replace(/_/g, ' ').toLowerCase();
        const memoTitleText = memoTitle.charAt(0).toUpperCase() + memoTitle.slice(1);

        const isDestAcceptAsset = availableAssets[choosenSlug].sendable;

        const isLedger = this.props.d.session.authType === AUTH_TYPE.LEDGER;

        return (
            <div className="Send_block">
                <div className="Send_title">
                    <h1>Review payment</h1>
                    <div className="field_description">
                        Transactions on the Stellar network are irreversible.{' '}
                        Please make sure all the transaction details are correct.
                    </div>
                </div>

                <div className="Send_details">
                    <div className="content_main">
                        <div className="content_block">
                            <div className="content_title">Recipient</div>
                            <div className="content_text">
                                <img src={identiconImg} alt="identicon" className="identicon_resolved" />
                                <span className="publicKey_resolved">
                                    {accountId}
                                </span>
                            </div>
                        </div>

                        {federationAddress !== '' ? (
                            <div className="content_block">
                                <div className="content_title">Recipient&apos;s federation address</div>
                                <div className="content_text">
                                    {federationAddress}
                                </div>
                            </div>
                        ) : null}

                        {memoType !== 'none' && memoContent !== '' && isDestAcceptAsset ? (
                            <div className="content_block">
                                <div className="content_title">{memoTitleText}</div>
                                <div className="content_text">{memoContent}</div>
                            </div>
                        ) : null}

                        <div className="review_data">
                            <div className="content_block">
                                <div className="content_title">Amount</div>
                                <div className="content_text">{amountToSend} {assetToSend.asset.code}</div>
                            </div>
                            <div className="content_block">
                                <div className="content_title">Asset</div>
                                <div className="content_text">
                                    <AssetCardInRow
                                        code={assetToSend.asset.code}
                                        issuer={assetToSend.asset.issuer}
                                        d={this.props.d}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {!isDestAcceptAsset &&
                    <div className="field_description warning">
                        <img src={images['icon-warning-big']} alt="" />
                        <span>
                            The recipient has not accepted this asset, so it will be sent as Claimable Balance.{' '}
                            If the recipient does not accept the payment within 24 hours,
                            you will be able to return the payment.
                            You can find your payment in the tab Pending payments
                        </span>
                    </div>
                }

                <div className="Send_button_block">
                    <button
                        className="s-btn_cancel"
                        disabled={isPending && !isLedger}
                        onClick={() => clickBackToSend()}
                    >
                        Back
                    </button>

                    <button
                        className="s-button"
                        disabled={isPending && !isLedger}
                        onClick={() => this.onClickSubmit()}
                    >
                        {state === 'pending' ? <div className="nk-spinner" /> : 'Submit transaction'}
                    </button>
                </div>
            </div>
        );
    }
}
SendReview.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
