/* eslint-disable camelcase */
import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import * as StellarSdk from 'stellar-sdk';
import PropTypes from 'prop-types';
import directory from 'stellarterm-directory';
import Driver from '../../../../lib/driver/Driver';
import images from '../../../../images';
import {
    getTransferServer,
    getTransferServerInfo,
    getTransactions,
    checkAssetSettings,
} from '../../../../lib/helpers/SepUtils';
import { getUrlWithParams } from '../../../../lib/api/endpoints';
import Stellarify from '../../../../lib/helpers/Stellarify';
import AssetRow from '../../../Common/AssetRow/AssetRow';
import AppLoading from '../../../AppLoading/AppLoading';
import { mapShortStatus, mapStatusIcon } from '../../../../lib/constants/sep24Constants';
import { formatNumber } from '../../../../lib/helpers/Format';
import TransactionContent from '../../../GlobalModal/Sep24Modal/TransactionContent/TransactionContent';

const TRANSACTIONS_LIMIT = 10;
const ROW_HEIGHT = 41;

const HISTORY_EMPTY = 'no history';

export default class SepTransactions extends React.Component {
    constructor(props) {
        super(props);

        this.transferServer = null;
        this.TRANSFER_SERVER = null;
        this.WEB_AUTH_URL = null;
        this.NETWORK_PASSPHRASE = null;
        this.jwtToken = null;

        this.state = {
            isLoading: true,
            errorMsg: false,
            sepAsset: null,
        };
    }

    componentDidMount() {
        this.getUserTransactions();
    }

    onClickTransaction(asset, transaction) {
        const isDeposit = transaction.kind === 'deposit';

        // Open sep popup with polling of anchor endpoint, if needed
        this.props.d.modal.handlers.activate(`Sep${asset.sep24 ? '24' : '6'}Modal`, {
            asset,
            isDeposit,
            transaction,
            jwtToken: this.jwtToken,
            transferServer: this.transferServer,
            isDetailsModal: true,
        });
    }

    onClickLoadMore() {
        const { code, transactions, sep24 } = this.state.sepAsset;

        const requestParams = {
            asset_code: code,
            limit: TRANSACTIONS_LIMIT,
            account: this.props.d.session.account.accountId(),
            paging_id: transactions[transactions.length - 1].id,
        };
        this.setState({ isLoading: true });

        getTransactions(this.TRANSFER_SERVER, requestParams, this.jwtToken, sep24)
            .then(res => {
                const newAssetState = this.state.sepAsset;
                newAssetState.transactions = transactions.concat(res.transactions);

                this.setState({
                    sepAsset: newAssetState,
                    isLoading: false,
                    fullLoaded: res.transactions.length === 0,
                });
            })
            .catch(res => {
                this.setState({
                    isLoading: false,
                    errorMsg: (res && res.error) ? res.error : this.state.errorMsg,
                });
            });
    }

    async getUserTransactions() {
        // This func generate state, based on asset from GET params
        const account = this.props.d.session.account;
        const urlParams = new URLSearchParams(window.location.search);
        let parsedAsset;

        try {
            parsedAsset = Stellarify.parseAssetSlug(urlParams.get('asset'));
        } catch (e) {
            this.setState({ sepAsset: { notFound: true } });
            return;
        }

        let asset = _.find(directory.assets, {
            code: parsedAsset.code, issuer: parsedAsset.issuer,
        });

        const { isHistoryEnabled } = checkAssetSettings(asset);

        if (isHistoryEnabled && parsedAsset) {
            const reservedAmount = account.getReservedBalance(parsedAsset);
            const userHaveTrustline = reservedAmount !== null;

            asset = Object.assign(asset, {
                userHaveTrustline,
                transactions: [],
            });
        }

        if (!asset) {
            this.setState({ sepAsset: { notFound: true } });
            return;
        }

        // Then attempt to fetch user transactions for selected acnhor
        const transferDomain = urlParams.get('anchorDomain');

        const transferServer = await getTransferServer(asset, 'history', this.props.d.modal, transferDomain);

        if (transferServer === 'cancelled') {
            this.props.history.push('/account/');
            return;
        }

        if (!transferServer) {
            this.props.d.toastService.error(
                'Transfer history not available',
                `Transfer history for ${asset.code} not available at the moment. Try back later.`,
            );
            this.props.history.push('/account/');
            return;
        }

        this.transferServer = transferServer;
        this.TRANSFER_SERVER = transferServer.TRANSFER_SERVER_SEP0024 || transferServer.TRANSFER_SERVER;
        this.WEB_AUTH_URL = transferServer.WEB_AUTH_URL;
        this.NETWORK_PASSPHRASE = transferServer.NETWORK_PASSPHRASE;

        try {
            const transferServerInfo = await getTransferServerInfo(this.TRANSFER_SERVER);
            asset.info = transferServerInfo;

            if (asset.sep24) {
                const { transactions } = await this.checkForJwt(asset);
                asset.transactions = transactions || [];
                this.setState({
                    sepAsset: asset,
                    isLoading: false,
                    errorMsg: transactions.length === 0 ? HISTORY_EMPTY : this.state.errorMsg,
                });
                return;
            }

            if (transferServerInfo.transactions.enabled && !transferServerInfo.transactions.authentication_required) {
                const { transactions } = await this.checkForJwt(asset, true);
                asset.transactions = transactions || [];
                this.setState({
                    sepAsset: asset,
                    isLoading: false,
                    errorMsg: transactions.length === 0 ? HISTORY_EMPTY : this.state.errorMsg,
                });
                return;
            }

            if (!transferServerInfo.transactions.enabled) {
                this.setState({
                    sepAsset: asset,
                    isLoading: false,
                    errorMsg: 'Transfer history for this asset has been temporarily disabled by the anchor.',
                });
                return;
            }

            const { transactions } = await this.checkForJwt(asset);
            asset.transactions = transactions || [];
            this.setState({
                sepAsset: asset,
                isLoading: false,
                errorMsg: transactions.length === 0 ? HISTORY_EMPTY : this.state.errorMsg,
            });
        } catch (e) {
            this.setState({
                sepAsset: asset,
                isLoading: false,
                errorMsg: this.state.errorMsg || 'Transfer history is temporarily unavailable for this asset.',
            });
        }
    }

    getTransactionRow() {
        const { isLoading, errorMsg, fullLoaded, sepAsset } = this.state;
        const { transactions } = sepAsset;

        const transactionsContent = transactions ? (
            transactions.map(transaction => {
                const {
                    kind,
                    status,
                    started_at,
                    amount_in,
                    amount_in_asset,
                    amount_out,
                    amount_out_asset,
                    amount_fee,
                    amount_fee_asset,
                } = transaction;

                const transactionKindIcon = kind === 'deposit' ? (
                    <img src={images['icon-deposit']} alt="up" className="type-icon" />
                ) : (
                    <img src={images['icon-withdraw']} alt="down" className="type-icon" />
                );

                const statusIconName = mapStatusIcon(status);

                return (
                    <div
                        key={transaction.id}
                        className="Activity-table-row sep-transaction-row"
                        onClick={() => this.onClickTransaction(sepAsset, transaction)}
                    >

                        <div className="Activity-table-cell flex4">
                            <span>{moment(new Date(started_at)).format('MM/DD/YYYY HH:mm')}</span>
                        </div>

                        <div className="Activity-table-cell flex4">
                            {transactionKindIcon}
                            <span>{kind}</span>
                        </div>

                        <div className="Activity-table-cell flex5">
                            <span>{amount_in ? `${formatNumber(amount_in)} ${TransactionContent.getAssetCode(amount_in_asset, sepAsset)}` : '-'}</span>
                        </div>

                        <div className="Activity-table-cell flex3">
                            <span>{amount_fee ? `${formatNumber(amount_fee)} ${TransactionContent.getAssetCode(amount_fee_asset, sepAsset)}` : '-'}</span>
                        </div>

                        <div className="Activity-table-cell flex5">
                            <span>{amount_out ? `${formatNumber(amount_out)} ${TransactionContent.getAssetCode(amount_out_asset, sepAsset)}` : '-'}</span>
                        </div>

                        <div className="Activity-table-cell flex5">
                            {statusIconName ? <img src={images[statusIconName]} alt={statusIconName} className="type-icon" /> : null}
                            <span>{mapShortStatus(status)}</span>
                        </div>
                    </div>
                );
            })) : null;

        const loadMoreContent = (
            <div className="Activity-table-row load-more-row" onClick={() => this.onClickLoadMore()}>
                <div className="Activity-table-cell flex1">
                    {isLoading && transactions.length !== 0 ? (
                        <span className="nk-spinner-green">
                            <div className="nk-spinner" />
                        </span>
                    ) : null}

                    {transactions.length >= TRANSACTIONS_LIMIT && !isLoading ? (
                        <span>Load more</span>
                    ) : null }
                </div>
            </div>
        );

        const isNeedLoadMore = !errorMsg && transactions.length >= TRANSACTIONS_LIMIT && !fullLoaded;

        return (
            <React.Fragment>
                {isLoading && transactions.length === 0 ? (
                    <div className="Activity-table-row load-more-row">
                        <div className="Activity-table-cell flex1">
                            <span className="nk-spinner-green">
                                <div className="nk-spinner" />
                            </span>
                        </div>
                    </div>
                ) : null}

                {errorMsg || !transactionsContent ? (
                    <div className="transaction-row-error">
                        <span className="error-span">
                            {
                                errorMsg === HISTORY_EMPTY ?
                                    <span>You have not made any deposits or withdrawals of this asset.</span> :
                                    <React.Fragment>
                                        <img src={images['icon-circle-fail']} alt="failed" />
                                        {errorMsg}
                                    </React.Fragment>
                            }
                        </span>
                    </div>
                ) : null}

                {transactionsContent}

                {isNeedLoadMore ? loadMoreContent : null}
            </React.Fragment>
        );
    }

    async getJwtToken(endpoint) {
        const { d } = this.props;

        const tokenFromCache = d.session.handlers.getTokenFromCache(endpoint);

        if (tokenFromCache) { return tokenFromCache; }

        let challengeTx = await d.session.handlers.getAuthChallengeTx(endpoint, this.NETWORK_PASSPHRASE);

        if (d.multisig.isMultisigEnabled && d.multisig.moreSignaturesNeeded(challengeTx)) {
            challengeTx = await this.getSignedBySignersChallenge(challengeTx);
        }

        const { signedTx } = await d.session.handlers.sign(challengeTx);

        const token = await d.session.handlers.getToken(endpoint, signedTx);

        return token;
    }

    getSignedBySignersChallenge(tx) {
        this.challengeTx = tx;
        const promise = new Promise((resolve, reject) => {
            this.signedChallengeResolver = resolve;
            this.signedChallengeRejecter = reject;
        });

        this.props.d.modal.handlers.activate('SignChallengeWithMultisig', { tx, resolver: this.signedChallengeResolver })
            .then(({ status }) => {
                if (status === 'cancel') {
                    this.signedChallengeRejecter();
                    this.setState({ errorMsg: 'Authentication failed' });
                }
            });

        return promise.then(res => {
            this.props.d.modal.handlers.finish();
            return res;
        });
    }

    checkForJwt(asset, noAuth) {
        const { d } = this.props;
        const requestParams = {
            asset_code: asset.code,
            account: d.session.account.accountId(),
            limit: TRANSACTIONS_LIMIT,
        };

        const params = { account: requestParams.account };

        if (noAuth) {
            return getTransactions(this.TRANSFER_SERVER, requestParams, null, asset.sep24, noAuth);
        }

        const jwtEndpointUrl = getUrlWithParams(this.WEB_AUTH_URL, params);

        return this.getJwtToken(jwtEndpointUrl).then(token => {
            this.jwtToken = token;
            return getTransactions(this.TRANSFER_SERVER, requestParams, this.jwtToken, asset.sep24, noAuth);
        });
    }

    render() {
        const { sepAsset, isLoading } = this.state;

        if (!sepAsset) {
            return <AppLoading text={'Loading transfer history'} />;
        }

        const transactionsCount = sepAsset.transactions.length;
        const minHeight = isLoading && transactionsCount === 0 ? ROW_HEIGHT : '130px';

        return (
            <div className="island Activity">
                <div className="island__header">Transfer history</div>
                <div className="Activity_wrap Sep_transactions">
                    {sepAsset.notFound ? null : (
                        <div className="AssetRowContainer">
                            <AssetRow
                                d={this.props.d}
                                hideMessage
                                asset={new StellarSdk.Asset(sepAsset.code, sepAsset.issuer)}
                            />
                        </div>
                    )}

                    <div className="Activity-table">
                        {sepAsset.notFound ? (
                            <div className="transaction-row-error">
                                <span className="error-span">
                                    <img src={images['icon-circle-fail']} alt="failed" />
                                    Asset provided in url not found!
                                </span>
                            </div>
                        ) : (
                            <React.Fragment>
                                {transactionsCount > 0 ? (
                                    <div className="Activity-table-row head">
                                        <div className="Activity-table-cell flex4">Date/Time</div>
                                        <div className="Activity-table-cell flex4">Type</div>
                                        <div className="Activity-table-cell flex5">Amount you send</div>
                                        <div className="Activity-table-cell flex3">Fees</div>
                                        <div className="Activity-table-cell flex5">Amount you receive</div>
                                        <div className="Activity-table-cell flex5">Status</div>
                                    </div>
                                ) : null}

                                <div
                                    className="Activity-table-body"
                                    style={{ minHeight: `${minHeight}px` }}
                                >
                                    {this.getTransactionRow()}
                                </div>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

SepTransactions.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    history: PropTypes.objectOf(PropTypes.any),
};
