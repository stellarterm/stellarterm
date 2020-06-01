/* eslint-disable camelcase */
import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import * as StellarSdk from 'stellar-sdk';
import PropTypes from 'prop-types';
import directory from 'stellarterm-directory';
import Driver from '../../../../lib/Driver';
import images from '../../../../images';
import { getTransferServer, getTransferServerInfo, getTransactions } from '../../../../lib/SepUtils';
import { getUrlWithParams } from '../../../../lib/api/endpoints';
import Stellarify from '../../../../lib/Stellarify';
import AssetRow from '../../../Common/AssetRow/AssetRow';

const TRANSACTIONS_LIMIT = 10;
const ROW_HEIGHT = 41;

export default class SepTransactions extends React.Component {
    constructor(props) {
        super(props);

        this.TRANSFER_SERVER = null;
        this.WEB_AUTH_URL = null;
        this.NETWORK_PASSPHRASE = null;
        this.jwtToken = null;

        this.state = {
            isLoading: true,
            errorMsg: false,
            sepAsset: this.getUserTransactions(),
        };
    }

    onClickTransaction(asset, transaction) {
        const isDeposit = transaction.kind === 'deposit';

        // Open sep popup with polling of anchor endpoint, if needed
        this.props.d.modal.handlers.activate(`Sep${asset.sep24 ? '24' : '6'}Modal`, {
            asset,
            isDeposit,
            transaction,
            jwtToken: this.jwtToken,
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
            .then((res) => {
                const newAssetState = this.state.sepAsset;
                newAssetState.transactions = transactions.concat(res.transactions);

                this.setState({
                    sepAsset: newAssetState,
                    isLoading: false,
                    fullLoaded: res.transactions.length === 0,
                });
            })
            .catch((res) => {
                this.setState({
                    isLoading: false,
                    errorMsg: (res && res.error) ? res.error : this.state.errorMsg,
                });
            });
    }

    getUserTransactions() {
        // This func generate state, based on asset from GET params
        const account = this.props.d.session.account;
        const urlParams = new URLSearchParams(window.location.search);
        let parsedAsset;

        try {
            parsedAsset = Stellarify.parseAssetSlug(urlParams.get('asset'));
        } catch (e) {
            return { notFound: true };
        }

        let asset = _.find(directory.assets, {
            code: parsedAsset.code, issuer: parsedAsset.issuer,
        });
        if ((asset.deposit || asset.withdraw) && parsedAsset) {
            const reservedAmount = account.getReservedBalance(parsedAsset);
            const userHaveTrustline = reservedAmount !== null;

            asset = Object.assign(asset, {
                userHaveTrustline,
                transactions: [],
            });
        }

        if (!asset) { return { notFound: true }; }

        // Then attempt to fetch user transactions for selected acnhor
        getTransferServer(asset.domain)
            .then(({ TRANSFER_SERVER_SEP0024, TRANSFER_SERVER, WEB_AUTH_URL, NETWORK_PASSPHRASE }) => {
                this.TRANSFER_SERVER = TRANSFER_SERVER_SEP0024 || TRANSFER_SERVER;
                this.WEB_AUTH_URL = WEB_AUTH_URL;
                this.NETWORK_PASSPHRASE = NETWORK_PASSPHRASE;
            })
            .then(() => getTransferServerInfo(this.TRANSFER_SERVER))
            .then((info) => {
                asset.info = info;
                if (!info.transactions.enabled) {
                    this.setState({
                        sepAsset: asset,
                        isLoading: false,
                        errorMsg: 'Transfer history for this asset has been temporarily disabled by the anchor.',
                    });
                    return null;
                }
                return this.checkForJwt(asset);
            })
            .then(({ transactions }) => {
                asset.transactions = transactions || [];
                this.setState({
                    sepAsset: asset,
                    isLoading: false,
                    errorMsg: transactions.length === 0 ? 'You have not made any deposits or withdrawals of this asset.' : this.state.errorMsg,
                });
            })
            .catch(() => {
                this.setState({
                    sepAsset: asset,
                    isLoading: false,
                    errorMsg: this.state.errorMsg || 'Transfer history is temporarily unavailable for this asset.',
                });
            });
        return asset;
    }

    getTranactionRow() {
        const { isLoading, errorMsg, fullLoaded, sepAsset } = this.state;
        const { transactions } = sepAsset;

        const transactionsContent = transactions ? (
            transactions.map((transaction) => {
                const {
                    kind,
                    status,
                    started_at,
                    amount_in,
                    amount_out,
                    amount_fee,
                } = transaction;

                const readableStatus = status.replace(/_/g, ' ');
                const kindIconClassname = kind === 'deposit' ? 'deposit_icon' : 'withdraw_icon';
                const transactionKindIcon = kind === 'deposit' ? (
                    <span className={kindIconClassname}><img src={images['icon-trade-up']} alt="up" /></span>
                ) : (
                    <span className={kindIconClassname}><img src={images['icon-trade-down']} alt="down" /></span>
                );

                return (
                    <div
                        key={transaction.id}
                        className="Activity-table-row sep-transaction-row"
                        onClick={() => this.onClickTransaction(sepAsset, transaction)}>

                        <div className="Activity-table-cell flex5">
                            <span>{moment(new Date(started_at)).format('MMMM D YYYY, HH:mm')}</span>
                        </div>

                        <div className="Activity-table-cell flex5">
                            {transactionKindIcon}
                            <span>{kind}</span>
                        </div>

                        <div className="Activity-table-cell flex5">
                            <span>{readableStatus}</span>
                        </div>

                        <div className="Activity-table-cell flex3 flex-end">
                            <span>{amount_fee ? `${amount_fee} ${sepAsset.code}` : '-'}</span>
                        </div>

                        <div className="Activity-table-cell flex3 flex-end">
                            <span>{amount_in ? `${amount_in} ${sepAsset.code}` : '-'}</span>
                        </div>

                        <div className="Activity-table-cell flex3 flex-end">
                            <span>{amount_out ? `${amount_out} ${sepAsset.code}` : '-'}</span>
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
                            <img src={images['icon-circle-fail']} alt="failed" />
                            {errorMsg}
                        </span>
                    </div>
                ) : null}

                {transactionsContent}

                {isNeedLoadMore ? loadMoreContent : null}
            </React.Fragment>
        );
    }

    checkForJwt(asset) {
        const { d } = this.props;
        const requestParams = {
            asset_code: asset.code,
            account: d.session.account.accountId(),
            limit: TRANSACTIONS_LIMIT,
        };

        const params = { account: requestParams.account };
        const jwtEndpointUrl = getUrlWithParams(this.WEB_AUTH_URL, params);

        return d.session.handlers.getJwtToken(jwtEndpointUrl, this.NETWORK_PASSPHRASE).then((token) => {
            this.jwtToken = token;
            return getTransactions(this.TRANSFER_SERVER, requestParams, this.jwtToken, asset.sep24);
        });
    }

    render() {
        const { sepAsset, isLoading } = this.state;
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
                                asset={new StellarSdk.Asset(sepAsset.code, sepAsset.issuer)} />
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
                                        <div className="Activity-table-cell flex5">Date/Time</div>
                                        <div className="Activity-table-cell flex5">Type</div>
                                        <div className="Activity-table-cell flex5">Status</div>
                                        <div className="Activity-table-cell flex3 flex-end">Fee</div>
                                        <div className="Activity-table-cell flex3 flex-end">Amount in</div>
                                        <div className="Activity-table-cell flex3 flex-end">Amount out</div>
                                    </div>
                                ) : null}

                                <div
                                    className="Activity-table-body"
                                    style={{ minHeight: `${minHeight}px` }}>
                                    {this.getTranactionRow()}
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
};
