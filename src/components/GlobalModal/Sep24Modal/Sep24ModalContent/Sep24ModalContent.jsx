/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from '@stellar/stellar-sdk';
import images from '../../../../images';
import { HOST_SIGN_ORIGINS } from '../../../../env-consts';
import Driver from '../../../../lib/driver/Driver';
import Sep24ModalFooter from '../Common/Sep24ModalFooter/Sep24ModalFooter';
import { getTransferServerInfo, sep24Request, getTransaction } from '../../../../lib/helpers/SepUtils';
import { getUrlWithParams } from '../../../../lib/api/endpoints';
import TransactionContent from '../TransactionContent/TransactionContent';
import FeeBlock from '../Common/FeeBlock';
import MinMaxAmount from '../Common/MinMaxAmount';
import AssetBalance from '../AssetBalance/AssetBalance';
import { AUTH_TYPE } from '../../../../lib/constants/sessionConstants';
import SignChallengeBlock from '../../../Common/SignChallengeBlock/SignChallengeBlock';
import { removeIdFromCache } from '../../../../lib/constants/sep24Constants';

export default class Sep24ModalContent extends React.Component {
    constructor(props) {
        super(props);

        this.assetInfo = {};
        this.jwtToken = this.props.jwtToken;
        this.TRANSFER_SERVER_SEP0024 = this.props.transferServer.TRANSFER_SERVER_SEP0024;
        this.WEB_AUTH_URL = this.props.transferServer.WEB_AUTH_URL;
        this.NETWORK_PASSPHRASE = this.props.transferServer.NETWORK_PASSPHRASE;
        this.SUPPORT = this.props.transferServer.SUPPORT;

        this.state = {
            isLoading: !this.props.transaction,
            assetDisabled: false,
            reqErrorMsg: null,
            transaction: this.props.transaction,
            windowClosed: false,
            requestParams: {
                wallet_name: 'StellarTerm',
                wallet_url: 'https://stellarterm.com',
                asset_code: this.props.asset.code,
                account: this.props.d.session.account.accountId(),
            },
            showGetTokenFlow: false,
            bridgeSignRequest: null,
            bridgeSignPending: false,
        };

        this.callbackHandler = this.callbackHandler.bind(this);
        this.openAnchorWindow = this.openAnchorWindow.bind(this);
        this.confirmBridgeSign = this.confirmBridgeSign.bind(this);
        this.rejectBridgeSign = this.rejectBridgeSign.bind(this);
    }

    componentDidMount() {
        window.addEventListener('message', this.callbackHandler, false);

        if (this.state.transaction) {
            this.initSep24()
                .then(() => this.fetchTransaction())
                .catch(({ data }) => {
                    this.setState({
                        isLoading: false,
                        reqErrorMsg: (data && data.error) ? data.error : this.state.reqErrorMsg,
                    });
                });
            return;
        }

        this.createNewTransaction();
    }

    componentWillUnmount() {
        this.isUnmounted = true;
        clearTimeout(this.pollingTimeout);
        window.removeEventListener('message', this.callbackHandler, false);
    }


    async getJwtToken(endpoint) {
        const { d, asset, isDeposit } = this.props;

        const tokenFromCache = d.session.handlers.getTokenFromCache(endpoint);

        if (tokenFromCache) { return tokenFromCache; }

        let challengeTx = await d.session.handlers.getAuthChallengeTx(endpoint, this.NETWORK_PASSPHRASE);

        if (d.multisig.isMultisigEnabled && d.multisig.moreSignaturesNeeded(challengeTx)) {
            challengeTx = await this.getSignedBySignersChallenge(challengeTx);
        }

        const isLedger = d.session.authType === AUTH_TYPE.LEDGER;
        const isWalletConnect = d.session.authType === AUTH_TYPE.WALLET_CONNECT;

        if (isLedger) {
            d.modal.handlers.finish();
        }
        const { signedTx } = await d.session.handlers.sign(challengeTx);

        const token = await d.session.handlers.getToken(endpoint, signedTx);

        if (isLedger || isWalletConnect) {
            d.modal.nextModalName = 'Sep24Modal';
            d.modal.nextModalData = {
                isDeposit,
                asset,
                jwtToken: token,
                transferServer: this.props.transferServer,
            };
        }

        return token;
    }

    getSignedBySignersChallenge(tx) {
        this.challengeTx = tx;
        const promise = new Promise(resolve => {
            this.signedChallengeResolver = resolve;
        });
        this.setState({ showGetTokenFlow: true });

        return promise.then(signedTx => {
            this.setState({ showGetTokenFlow: false });
            return signedTx;
        });
    }

    initSep24() {
        const { isDeposit } = this.props;
        const { requestParams, transaction } = this.state;

        const params = { account: requestParams.account };
        const jwtEndpointUrl = getUrlWithParams(this.WEB_AUTH_URL, params);

        if (this.jwtToken) {
            if (transaction) { return Promise.resolve(); }
            return sep24Request(this.TRANSFER_SERVER_SEP0024, isDeposit, this.jwtToken, requestParams);
        }

        return this.getJwtToken(jwtEndpointUrl)
            .then(token => {
                this.jwtToken = token;
                if (transaction) { return token; }
                return sep24Request(this.TRANSFER_SERVER_SEP0024, isDeposit, this.jwtToken, requestParams);
            });
    }

    createNewTransaction(immediatelyStart) {
        const { asset, isDeposit } = this.props;

        getTransferServerInfo(this.TRANSFER_SERVER_SEP0024)
            .then(transferInfo => (isDeposit ? transferInfo.deposit : transferInfo.withdraw))
            .then(info => {
                const transferAssetInfo = info[asset.code];
                this.assetInfo = transferAssetInfo;

                if (!transferAssetInfo.enabled) {
                    this.setState({
                        assetDisabled: true,
                        reqErrorMsg: `This anchor has temporarily disabled ${asset.code} ${
                            isDeposit ? 'deposits' : 'withdrawals'
                        }.`,
                    });
                    return null;
                }
                return this.initSep24();
            })
            .then(res => {
                this.setState({
                    isLoading: false,
                    transaction: res,
                    reqErrorMsg: (res && res.error) ? res.error : this.state.reqErrorMsg,
                    windowClosed: false,
                }, () => {
                    if (immediatelyStart) {
                        this.openAnchorWindow();
                    }
                });
            })
            .catch(({ data }) => {
                this.setState({
                    isLoading: false,
                    reqErrorMsg: (data && data.error) ? data.error : `Failed to obtain ${isDeposit ? 'deposit' : 'withdraw'} details for this asset!`,
                });
            });
    }

    fetchTransaction() {
        const transactionParams = { id: this.state.transaction.id };
        const statusIsInactive =
            this.state.transaction.status === 'incomplete' ||
            this.state.transaction.status === 'completed';
        // Poll transactions anchor endpoint, if transaction is between 2 ending statuses

        getTransaction(this.TRANSFER_SERVER_SEP0024, transactionParams, this.jwtToken)
            .then(({ transaction }) => {
                clearTimeout(this.pollingTimeout);
                this.setState({ transaction });

                if (!this.props.isDeposit && this.state.transaction.status !== 'pending_user_transfer_start') {
                    removeIdFromCache(transaction.id);
                }

                if (statusIsInactive) {
                    removeIdFromCache(transaction.id);
                    return null;
                }

                this.pollingTimeout = setTimeout(() => {
                    this.fetchTransaction();
                }, 5000);

                return transaction;
            })
            .catch(res => {
                clearTimeout(this.pollingTimeout);
                this.setState({ reqErrorMsg: (res && res.error) ? res.error : 'Unknown error' });
            });

        const isWaitingForWithdraw = !this.props.isDeposit &&
            this.state.transaction.status === 'pending_user_transfer_start';

        if (isWaitingForWithdraw && !this.state.windowClosed && this.anchorWindow) {
            this.anchorWindow.close();
        }
    }

    callbackHandler(event) {
        // Only the window we opened may talk to us; anything else on the page can post messages too.
        if (!this.anchorWindow || event.source !== this.anchorWindow) {
            return;
        }

        if (event.data && event.data.sep24HostSign === 1) {
            this.bridgeMessageHandler(event);
            return;
        }

        const { transaction } = event.data;

        if (transaction) {
            this.setState({ transaction });

            if (this.props.isDeposit && this.transactionInited === undefined) {
                this.transactionInited = true;
                this.anchorWindow.location.href = transaction.more_info_url;
            }
            this.fetchTransaction();
        }
    }

    // anchorOrigin proves which window sent the message, not that its anchor is ours — hence the allowlist.
    canHostSign() {
        const { d } = this.props;
        // Ledger needs its own modal slot (busy here) and Trezor can't transform Soroban ops.
        return (
            HOST_SIGN_ORIGINS.includes(this.anchorOrigin) &&
            !d.multisig.isMultisigEnabled &&
            d.session.authType !== AUTH_TYPE.LEDGER &&
            d.session.authType !== AUTH_TYPE.TREZOR &&
            d.session.authType !== AUTH_TYPE.PUBKEY
        );
    }

    // Host-signing bridge for anchors whose interactive page runs the swap itself
    // (SEP-24 host signing profile): the page asks us to sign with the logged-in method.
    bridgeMessageHandler(event) {
        // Signing requests are held to a stricter bar: only the exact origin we opened.
        if (event.origin !== this.anchorOrigin) {
            return;
        }
        const { d } = this.props;
        const { type, id, xdr } = event.data;

        if (type === 'hello') {
            this.postToBridge({
                type: 'ready',
                address: d.session.account.accountId(),
                capabilities: this.canHostSign() ? ['sign_tx'] : [],
            });
            return;
        }

        if (type === 'sign_tx') {
            // capabilities are advisory — a page can ask anyway, so re-check before opening a confirm.
            if (!this.canHostSign()) {
                this.postToBridge({ type: 'reject', id, code: -3, message: 'Host signing is not available' });
                return;
            }
            // One request at a time: a silently dropped id leaves the page waiting forever.
            if (this.state.bridgeSignRequest) {
                this.postToBridge({ type: 'reject', id, code: -3, message: 'Another signature is already pending' });
                return;
            }
            let tx;
            try {
                tx = StellarSdk.TransactionBuilder.fromXDR(xdr, this.NETWORK_PASSPHRASE);
            } catch (e) {
                this.postToBridge({ type: 'reject', id, code: -3, message: 'Invalid transaction XDR' });
                return;
            }
            // Fee bumps expose feeSource, not source, and wrap another envelope — nothing we can review here.
            if (!(tx instanceof StellarSdk.Transaction) || tx.operations.length === 0) {
                this.postToBridge({ type: 'reject', id, code: -3, message: 'Unsupported transaction type' });
                return;
            }
            this.setState({ bridgeSignRequest: { id, tx } });
        }
    }

    postToBridge(message) {
        if (this.anchorWindow && !this.anchorWindow.closed) {
            this.anchorWindow.postMessage(Object.assign({ sep24HostSign: 1 }, message), this.anchorOrigin);
        }
    }

    async confirmBridgeSign() {
        const { d } = this.props;
        const { id, tx } = this.state.bridgeSignRequest;
        this.setState({ bridgeSignPending: true });
        try {
            const { signedTx } = await d.session.handlers.sign(tx, true);
            this.postToBridge({
                type: 'sign_tx_result',
                id,
                signedTxXdr: signedTx.toEnvelope().toXDR('base64'),
            });
        } catch (e) {
            this.postToBridge({ type: 'reject', id, code: -1, message: 'Signing failed' });
        }
        // Remote signers (WalletConnect) can resolve long after the user closed this modal.
        if (this.isUnmounted) {
            return;
        }
        this.setState({ bridgeSignRequest: null, bridgeSignPending: false });
    }

    rejectBridgeSign() {
        const { id } = this.state.bridgeSignRequest;
        this.postToBridge({ type: 'reject', id, code: -4, message: 'Declined by user' });
        this.setState({ bridgeSignRequest: null });
    }

    openAnchorWindow() {
        if (this.anchorWindow && this.anchorWindow.closed) {
            this.setState({ transaction: null, isLoading: true, bridgeSignRequest: null });
            this.anchorWindow = null;
            this.createNewTransaction(true);
            return;
        }
        const { transaction } = this.state;
        const isInfoNeeded = transaction.type === 'interactive_customer_info_needed';
        const urlWithCallback = new URL(transaction.url);
        urlWithCallback.searchParams.set('callback', 'postMessage');
        const transactionUrl = isInfoNeeded ? urlWithCallback.href : false;

        this.anchorOrigin = new URL(transaction.url).origin;
        this.anchorWindow = window.open(transactionUrl, '_blank');
        this.setState({ windowClosed: false });

        const closeCheckInterval = setInterval(() => {
            if (this.anchorWindow.closed) {
                this.fetchTransaction();
                // Drop any pending sign dialog: its window is gone, and its branch hides the retry UI.
                this.setState({ windowClosed: true, bridgeSignRequest: null });
                clearInterval(closeCheckInterval);
            }
        }, 500);
    }

    render() {
        const { reqErrorMsg, isLoading, transaction, assetDisabled, windowClosed, showGetTokenFlow } = this.state;
        const { d, asset, isDeposit, noActionBtn } = this.props;
        const isAnyError = reqErrorMsg !== null;

        const sepFooter = (
            <Sep24ModalFooter
                d={d}
                asset={asset}
                transferServer={this.props.transferServer}
                isDeposit={isDeposit}
                isLoading={isLoading}
                isAnyError={isAnyError}
                transaction={transaction}
                noActionBtn={noActionBtn}
                windowClosed={windowClosed}
                openAnchorWindow={() => this.openAnchorWindow()}
            />
        );

        if (this.state.bridgeSignRequest) {
            const { tx } = this.state.bridgeSignRequest;
            const { bridgeSignPending } = this.state;
            return (
                <React.Fragment>
                    <AssetBalance d={d} asset={asset} transaction={transaction} isDeposit={isDeposit} />

                    <div className="content_main">
                        <p>
                            The {isDeposit ? 'deposit' : 'withdrawal'} page requests your signature to
                            continue. Review and confirm to sign with your current login method.
                        </p>
                        <p>
                            Source account: {tx.source}
                            <br />
                            Operations: {tx.operations.length} ({tx.operations[0].type})
                            <br />
                            Network fee: up to {Number(tx.fee) / 10000000} XLM
                        </p>
                    </div>
                    <div className="Action_buttons">
                        <button
                            className="s-btn_cancel"
                            disabled={bridgeSignPending}
                            onClick={this.rejectBridgeSign}
                        >
                            Cancel
                        </button>
                        <button
                            className="s-button"
                            disabled={bridgeSignPending}
                            onClick={this.confirmBridgeSign}
                        >
                            {bridgeSignPending ? <div className="nk-spinner" /> : 'Sign'}
                        </button>
                    </div>
                </React.Fragment>
            );
        }

        if (showGetTokenFlow) {
            return (
                <React.Fragment>
                    <AssetBalance d={d} asset={asset} transaction={transaction} isDeposit={isDeposit} />

                    <SignChallengeBlock
                        d={d}
                        signedChallengeResolver={this.signedChallengeResolver}
                        challengeTx={this.challengeTx}
                    />
                </React.Fragment>
            );
        }

        if ((isAnyError || assetDisabled) && !isLoading) {
            return (
                <React.Fragment>
                    <AssetBalance d={d} asset={asset} transaction={transaction} isDeposit={isDeposit} />

                    <div className="content_error">
                        <div className="sep24_requestError">
                            <img src={images['icon-circle-fail']} alt="fail" />
                            <span>{reqErrorMsg}</span>
                        </div>
                    </div>

                    {sepFooter}
                </React.Fragment>
            );
        }

        if (isLoading) {
            return (
                <React.Fragment>
                    <AssetBalance d={d} asset={asset} transaction={transaction} isDeposit={isDeposit} />

                    <div className="content_main">
                        <div className="loader_container">
                            <div className="nk-spinner" />
                        </div>
                    </div>

                    {sepFooter}
                </React.Fragment>
            );
        }

        const isInfoNeeded = transaction.type === 'interactive_customer_info_needed';
        const kindText = isDeposit ? 'deposit' : 'withdrawal';

        let flowText;
        if (isInfoNeeded && !this.anchorWindow) {
            flowText = 'Click the \'Continue\' button below to proceed with the interactive portion of the flow in a new window.';
        } else if (isInfoNeeded && this.anchorWindow && !windowClosed) {
            flowText = `Enter the requested details in the opened window to continue with the ${kindText}.`;
        } else if (isInfoNeeded && this.anchorWindow && windowClosed) {
            flowText = `The interactive window has been closed before the information required for ${kindText} has been collected. Click the 'Retry' button to try again.`;
        }

        const allInfoProvided = !isInfoNeeded && !isLoading && !isAnyError;

        return (
            <React.Fragment>
                <AssetBalance d={d} asset={asset} transaction={transaction} isDeposit={isDeposit} />

                <div className="content_main">
                    {allInfoProvided ? (
                        <TransactionContent
                            d={d}
                            isDeposit={isDeposit}
                            asset={asset}
                            transaction={transaction}
                        />
                    ) : (
                        <React.Fragment>
                            <div className="content_block flow_text_block">
                                <div className="content_text">{flowText}</div>
                            </div>

                            <FeeBlock
                                feeFixed={parseFloat(this.assetInfo.fee_fixed) || 0}
                                feePercent={parseFloat(this.assetInfo.fee_percent) || 0}
                                assetCode={asset.code}
                                assetAnchor={asset.anchor_asset}
                                isDeposit={isDeposit}
                            />

                            <MinMaxAmount
                                minLimit={this.assetInfo.min_amount || ''}
                                maxLimit={this.assetInfo.max_amount || ''} a
                                assetCode={asset.code}
                                assetAnchor={asset.anchor_asset}
                                isDeposit={isDeposit}
                            />
                        </React.Fragment>
                    )}
                </div>

                {sepFooter}
            </React.Fragment>
        );
    }
}

Sep24ModalContent.propTypes = {
    jwtToken: PropTypes.string,
    isDeposit: PropTypes.bool.isRequired,
    noActionBtn: PropTypes.bool,
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.objectOf(PropTypes.any).isRequired,
    transaction: PropTypes.objectOf(PropTypes.any),
    transferServer: PropTypes.objectOf(PropTypes.any),
};
