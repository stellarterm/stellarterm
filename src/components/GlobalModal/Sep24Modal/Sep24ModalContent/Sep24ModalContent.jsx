/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';
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
        };

        this.callbackHandler = this.callbackHandler.bind(this);
        this.openAnchorWindow = this.openAnchorWindow.bind(this);
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
        clearTimeout(this.pollingTimeout);
        window.removeEventListener('message', this.callbackHandler, false);
    }


    async getJwtToken(endpoint) {
        const { d } = this.props;

        const tokenFromCache = d.session.handlers.getTokenFromCache(endpoint);

        if (tokenFromCache) { return tokenFromCache; }

        let challengeTx = await d.session.handlers.getAuthChallengeTx(endpoint, this.NETWORK_PASSPHRASE);

        if (d.multisig.isMultisigEnabled && d.multisig.moreSignaturesNeeded(challengeTx)) {
            challengeTx = await this.getSignedBySignersChallenge(challengeTx);
        }

        const isLedger = d.session.authType === AUTH_TYPE.LEDGER;

        if (isLedger) {
            d.modal.handlers.finish();
        }
        const { signedTx } = await d.session.handlers.sign(challengeTx);

        const token = await d.session.handlers.getToken(endpoint, signedTx);

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
        const { d, isDeposit, asset } = this.props;
        const { requestParams, transaction } = this.state;

        const params = { account: requestParams.account };
        const jwtEndpointUrl = getUrlWithParams(this.WEB_AUTH_URL, params);

        if (this.jwtToken) {
            if (transaction) { return Promise.resolve(); }
            return sep24Request(this.TRANSFER_SERVER_SEP0024, isDeposit, this.jwtToken, requestParams);
        }

        return this.getJwtToken(jwtEndpointUrl)
            .then(token => {
                const isLedger = d.session.authType === AUTH_TYPE.LEDGER;
                if (isLedger) {
                    d.modal.nextModalName = 'Sep24Modal';
                    d.modal.nextModalData = {
                        isDeposit,
                        asset,
                        jwtToken: token,
                        transferServer: this.props.transferServer,
                    };
                    return null;
                }
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

                if (statusIsInactive) { return null; }

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

    openAnchorWindow() {
        if (this.anchorWindow && this.anchorWindow.closed) {
            this.setState({ transaction: null, isLoading: true });
            this.anchorWindow = null;
            this.createNewTransaction(true);
            return;
        }
        const { transaction } = this.state;
        const isInfoNeeded = transaction.type === 'interactive_customer_info_needed';
        const urlWithCallback = new URL(transaction.url);
        urlWithCallback.searchParams.set('callback', 'postMessage');
        const transactionUrl = isInfoNeeded ? urlWithCallback.href : false;

        this.anchorWindow = window.open(transactionUrl, '_blank');
        this.setState({ windowClosed: false });

        const closeCheckInterval = setInterval(() => {
            if (this.anchorWindow.closed) {
                this.setState({ windowClosed: true });
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
