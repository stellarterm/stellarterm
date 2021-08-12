/* eslint-disable camelcase */
import React from 'react';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import createStellarIdenticon from 'stellar-identicon-js';
import ActivityFromEffectsBase from '../../Activity/ActivityFromEffectsBase';
import { formatDate, ROW_HEIGHT, SCROLL_WIDTH, TABLE_MAX_HEIGHT } from '../../Activity/Activity';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import Printify from '../../../../../lib/Printify';
import images from '../../../../../images';
import ClaimantsList from './ClaimantsList';


const PENDING_PAYMENTS_TYPES = [
    'claimable_balance_created',
    'claimable_balance_claimed',
];

const PENDING_PAYMENTS_ADDITIONAL_OPS = [
    'claimable_balance_sponsorship_removed',
];

const SPONSOR_CACHE = new Map();
const CLAIMANTS_CACHE = new Map();

export default class HistoryPendingPayments extends ActivityFromEffectsBase {
    static async goToStellarExpert(operation, isTestnet) {
        const { transaction_hash } = await operation();
        window.open(`https://stellar.expert/explorer/${isTestnet ? 'testnet' : 'public'}/tx/${transaction_hash}`, '_blank');
    }
    static filterEffects(history) {
        return history.filter(item => (PENDING_PAYMENTS_TYPES.includes(item.type)));
    }

    static getAdditionalOperations(history) {
        return history.filter(item => (PENDING_PAYMENTS_ADDITIONAL_OPS.includes(item.type)));
    }

    static getSponsor(history, id) {
        const [txId] = id.split('-');

        if (SPONSOR_CACHE.has(id)) {
            return SPONSOR_CACHE.get(id);
        }

        const sponsor = history
            .filter(item => (item.type === 'claimable_balance_sponsorship_removed'
                && item.id.includes(txId)))[0].former_sponsor;

        SPONSOR_CACHE.set(id, sponsor);

        return sponsor;
    }

    static getClaimants(op) {
        const { operation } = op;

        if (CLAIMANTS_CACHE.has(op.id)) {
            return CLAIMANTS_CACHE.get(op.id);
        }

        const claimants = operation().then(res => res.claimants.map(item => item.destination));

        CLAIMANTS_CACHE.set(op.id, claimants);

        return claimants;
    }

    getOpDetails(op, additionalOps) {
        switch (op.type) {
            case 'claimable_balance_claimed': {
                return {
                    opType: 'Received',
                    address: this.constructor.getSponsor(additionalOps, op.id),
                };
            }
            case 'claimable_balance_created': {
                return {
                    opType: 'Send',
                    address: this.constructor.getClaimants(op),
                };
            }
            default: return null;
        }
    }

    getPendingPaymentHistoryRow(historyItem, key, style, isTestnet, additionalOps) {
        const { created_at, asset, amount, operation } = historyItem;

        const { time, date } = formatDate(created_at);

        const { opType, address } = this.getOpDetails(historyItem, additionalOps);

        const isAddressString = typeof address === 'string';

        const renderedIcon = isAddressString && createStellarIdenticon(address).toDataURL();
        const viewAddress = isAddressString && `${address.substr(0, 18)}...${address.substr(-12, 12)}`;

        const assetCode = asset === 'native' ? 'XLM' : asset.split(':')[0];
        const assetIssuer = asset === 'native' ? null : asset.split(':')[1];


        return (
            <div key={key} style={style} className="Activity-table-row">
                <div className="Activity-table-cell">{date} {time}</div>
                <div className="Activity-table-cell flex2">{opType}</div>
                <div className="Activity-table-cell flex8">
                    {typeof address === 'string' ?
                        (<React.Fragment>
                            <div className="Activity-table-identicon">
                                <img src={renderedIcon} alt="id" />
                            </div>
                            {viewAddress}
                        </React.Fragment>) :
                        <ClaimantsList promiseWithAddresses={address} />
                    }
                </div>
                <div className="Activity-table-cell">
                    <AssetCardInRow d={this.props.d} code={assetCode} issuer={assetIssuer} />
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex3">
                    {Printify.lightenZeros(amount || '')}
                </div>
                <div className="Activity-table-cell Activity-table_actions flex1">
                    <img
                        title="StellarExpert"
                        src={images['icon-info']}
                        alt="i"
                        onClick={() => { this.constructor.goToStellarExpert(operation, isTestnet).then(); }}
                    />
                </div>
            </div>
        );
    }

    render() {
        const { d } = this.props;
        const { effectsHistory, loading, isFullLoaded } = d.effects;
        const pendingPaymentsHistory = this.constructor.filterEffects(effectsHistory);
        const additionalOps = this.constructor.getAdditionalOperations(effectsHistory);

        const listHeight = ROW_HEIGHT * pendingPaymentsHistory.length;
        const maxHeight = Math.min(listHeight, TABLE_MAX_HEIGHT);
        const withScroll = listHeight > TABLE_MAX_HEIGHT;

        if (isFullLoaded && !pendingPaymentsHistory.length) {
            return (
                <div className="Activity_empty">
                    You haven&apos;t received or sent any pending payments yet.
                </div>
            );
        }

        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>
                        Pending payments history
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
                    <div className="Activity-table-body" style={{ height: maxHeight }}>
                        <AutoSizer>
                            {({ height, width }) => (
                                <InfiniteLoader
                                    isRowLoaded={() => {}}
                                    rowCount={pendingPaymentsHistory.length}
                                    loadMoreRows={e => {
                                        if (e.stopIndex + 40 > pendingPaymentsHistory.length) {
                                            this.props.d.effects.loadMoreHistory();
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
                                            rowCount={pendingPaymentsHistory.length}
                                            rowRenderer={
                                                ({ key, index, style }) =>
                                                    this.getPendingPaymentHistoryRow(
                                                        pendingPaymentsHistory[index],
                                                        key,
                                                        style,
                                                        d.Server.isTestnet,
                                                        additionalOps,
                                                    )}
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
