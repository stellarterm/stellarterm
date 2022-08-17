/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import { List, AutoSizer, InfiniteLoader } from 'react-virtualized';
import createStellarIdenticon from 'stellar-identicon-js';
import Driver from '../../../../../lib/Driver';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import images from '../../../../../images';
import { formatDate, ROW_HEIGHT, SCROLL_WIDTH, TABLE_MAX_HEIGHT } from '../Activity';
import Printify from '../../../../../lib/Printify';
import { PAYMENTS_EVENTS } from '../../../../../lib/driver/Payments';

const PAYMENTS_TYPES = ['create_account', 'account_merge', 'payment'];

export default class ActivityPaymentsHistory extends React.Component {
    static filterPaymentsHistory(history) {
        return history.filter(item => (PAYMENTS_TYPES.includes(item.type)));
    }

    static getOperationTypeAndAddress(type, account, account_id, funder, from, to, into, to_muxed) {
        switch (type) {
            case 'create_account':
                return ({
                    opType: (account === account_id) ? 'Created by' : 'Created',
                    address: (account === account_id) ? funder : account,
                });
            case 'account_merge': return ({
                opType: (account === account_id) ? 'Account merged to' : 'Account merged',
                address: (account === account_id) ? into : account,
            });
            case 'payment': {
                const isSend = to !== account_id;
                return {
                    opType: isSend ?
                        <span>Send</span> :
                        <span>Receive</span>,
                    address: isSend ? (to_muxed || to) : from,
                };
            }
            default: break;
        }
        return null;
    }

    constructor(props) {
        super(props);

        if (!this.props.d.payments.paymentsHistory.length) {
            this.props.d.payments.getPaymentsHistory();
        }

        if (!this.props.d.effects.effectsHistory.length) {
            this.props.d.effects.getEffectsHistory();
        }

        this.unsubPayments = this.props.d.payments.event.sub(event => {
            if (event.type === PAYMENTS_EVENTS.NEXT_PAYMENTS_REQUEST &&
                !this.constructor.filterPaymentsHistory(event.newItems).length
            ) {
                this.props.d.payments.loadMorePaymentsHistory();
            }
            this.forceUpdate();
        });
        this.unsubEffects = this.props.d.effects.event.sub(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.unsubEffects();
        this.unsubPayments();
    }

    getPaymentsHistoryRow(historyItem, key, style, isTestnet) {
        const { account_id } = this.props.d.session.account;
        const { effectsHistory } = this.props.d.effects;

        const { account, funder, created_at, starting_balance,
            amount, to, from, asset_code, asset_issuer, transaction_hash, type, paging_token, into, to_muxed,
        } = historyItem;

        const { time, date } = formatDate(created_at);
        const { opType, address } =
            this.constructor.getOperationTypeAndAddress(type, account, account_id, funder, from, to, into, to_muxed);
        const canvas = createStellarIdenticon(address);
        const renderedIcon = canvas.toDataURL();
        const viewAddress = address && `${address.substr(0, 18)}...${address.substr(-12, 12)}`;

        const asset = asset_issuer ? new StellarSdk.Asset(asset_code, asset_issuer) : new StellarSdk.Asset.native();

        const itemFromCommonHistory = effectsHistory.find(item =>
            (item.paging_token.indexOf(paging_token) === 0 && item.amount));

        const viewAmount = amount || starting_balance
            || (itemFromCommonHistory && itemFromCommonHistory.amount);

        if (!viewAmount) {
            this.props.d.effects.loadMoreHistory();
        }

        return (
            <div key={key} style={style} className="Activity-table-row">
                <div className="Activity-table-cell">{date} {time}</div>
                <div className="Activity-table-cell flex2">{opType}</div>
                <div className="Activity-table-cell flex8">
                    <div className="Activity-table-identicon">
                        <img src={renderedIcon} alt="id" />
                    </div>
                    {viewAddress}
                </div>
                <div className="Activity-table-cell">
                    <AssetCardInRow d={this.props.d} code={asset.code} issuer={asset.issuer} />
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex3">
                    {Printify.lightenZeros(viewAmount || '')}
                </div>
                <div className="Activity-table_actions Activity-table-cell flex1">
                    <a
                        href={`https://stellar.expert/explorer/${isTestnet ? 'testnet' : 'public'}/tx/${transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img title="StellarExpert" src={images['icon-info']} alt="i" />
                    </a>
                </div>
            </div>
        );
    }


    render() {
        const { d } = this.props;
        const { paymentsHistory: history, loading } = d.payments;

        const paymentHistory = this.constructor.filterPaymentsHistory(history);

        const listHeight = ROW_HEIGHT * paymentHistory.length;
        const maxHeight = Math.min(listHeight, TABLE_MAX_HEIGHT);
        const withScroll = listHeight > TABLE_MAX_HEIGHT;

        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>
                        Payments history
                        {loading &&
                            <span className="nk-spinner-small-black">
                                <div className="nk-spinner" />
                            </span>}
                    </span>
                </div>
                <div className="Activity-table">
                    <div className="Activity-table-row head" style={{ marginRight: withScroll ? SCROLL_WIDTH : 0 }}>
                        <div className="Activity-table-cell">Date/Time</div>
                        <div className="Activity-table-cell flex2">Type</div>
                        <div className="Activity-table-cell flex8">Address</div>
                        <div className="Activity-table-cell">Asset</div>
                        <div className="Activity-table_item_right Activity-table-cell flex3">Amount</div>
                        <div className="Activity-table-cell Activity-table_actions flex1" />
                    </div>
                    <div style={{ height: maxHeight }} className="Activity-table-body">
                        <AutoSizer>
                            {({ height, width }) => (
                                <InfiniteLoader
                                    isRowLoaded={() => {}}
                                    rowCount={paymentHistory.length}
                                    loadMoreRows={e => {
                                        if (e.stopIndex + 40 > paymentHistory.length) {
                                            this.props.d.payments.loadMorePaymentsHistory();
                                        }
                                    }}
                                >
                                    {({ onRowsRendered, registerChild }) => (
                                        <List
                                            width={width}
                                            height={height}
                                            onRowsRendered={onRowsRendered}
                                            ref={registerChild}
                                            rowHeight={ROW_HEIGHT}
                                            rowCount={paymentHistory.length}
                                            rowRenderer={
                                                ({ key, index, style }) =>
                                                    this.getPaymentsHistoryRow(
                                                        paymentHistory[index],
                                                        key,
                                                        style,
                                                        d.Server.isTestnet)}
                                        />
                                    )}
                                </InfiniteLoader>
                            )}
                        </AutoSizer>
                    </div>
                </div>
            </div>
        );
    }
}
ActivityPaymentsHistory.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
