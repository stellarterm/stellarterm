/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { List, AutoSizer, InfiniteLoader } from 'react-virtualized';
import Driver from '../../../../../lib/driver/Driver';
import images from '../../../../../images';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import { formatDate, ROW_HEIGHT, SCROLL_WIDTH, TABLE_MAX_HEIGHT } from '../Activity';
import ActivityFromEffectsBase from '../ActivityFromEffectsBase';

const TRUSTLINE_TYPES = ['trustline_removed', 'trustline_created', 'trustline_updated'];

export default class ActivityTrustlinesHistory extends ActivityFromEffectsBase {
    static async goToStellarExpert(operation, isTestnet) {
        const { transaction_hash } = await operation();
        window.open(`https://stellar.expert/explorer/${isTestnet ? 'testnet' : 'public'}/tx/${transaction_hash}`, '_blank');
    }

    static filterEffects(history) {
        return history.filter(item => (TRUSTLINE_TYPES.includes(item.type) && item.asset_type !== 'liquidity_pool_shares'));
    }

    static getViewType(type) {
        switch (type) {
            case 'trustline_removed': return ({
                viewType: (<span className="red">Removed</span>),
            });
            case 'trustline_created': return ({
                viewType: (<span className="green">Created</span>),
            });
            case 'trustline_updated': return ({
                viewType: 'Updated',
            });
            default: break;
        }
        return null;
    }

    getTrustlinesHistoryRow(historyItem, key, style, isTestnet) {
        const { created_at, asset_code, asset_issuer, type, operation } = historyItem;
        const { time, date } = formatDate(created_at);
        const { viewType } = this.constructor.getViewType(type);
        const viewIssuer = asset_issuer &&
            `${asset_issuer.substr(0, 24)}...${asset_issuer.substr(-12, 12)}`;

        return (
            <div key={key} style={style} className="Activity-table-row">
                <div className="Activity-table-cell">{date} {time}</div>
                <div className="Activity-table-cell flex3">{viewType}</div>
                <div className="Activity-table-cell flex5">
                    <AssetCardInRow d={this.props.d} code={asset_code} issuer={asset_issuer} />
                </div>
                <div className="Activity-table-cell flex8">{viewIssuer}</div>
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
        const { effectsHistory, loading } = d.effects;
        const trustlineHistory = this.constructor.filterEffects(effectsHistory);

        if (!loading && trustlineHistory.length === 0) {
            return (
                <div className="Activity_empty">You have no trustlines history</div>
            );
        }

        const listHeight = ROW_HEIGHT * trustlineHistory.length;
        const maxHeight = Math.min(listHeight, TABLE_MAX_HEIGHT);
        const withScroll = listHeight > TABLE_MAX_HEIGHT;


        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>
                        Trustlines history
                        {loading &&
                            <span className="nk-spinner-small-black">
                                <div className="nk-spinner" />
                            </span>}
                    </span>
                </div>

                <div className="Activity-table">
                    <div className="Activity-table-row head" style={{ marginRight: withScroll ? SCROLL_WIDTH : 0 }}>
                        <div className="Activity-table-cell">Date/Time</div>
                        <div className="Activity-table-cell flex3">Type</div>
                        <div className="Activity-table-cell flex5">Asset</div>
                        <div className="Activity-table-cell flex8">Issuer</div>
                        <div className="Activity-table-cell Activity-table_actions flex1" />
                    </div>
                    <div className="Activity-table-body" style={{ height: maxHeight }}>
                        <AutoSizer>
                            {({ height, width }) => (
                                <InfiniteLoader
                                    isRowLoaded={() => {}}
                                    rowCount={trustlineHistory.length}
                                    loadMoreRows={e => {
                                        if (e.stopIndex + 40 > trustlineHistory.length) {
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
                                            rowCount={trustlineHistory.length}
                                            rowRenderer={
                                                ({ key, index, style }) =>
                                                    this.getTrustlinesHistoryRow(
                                                        trustlineHistory[index], key, style, d.Server.isTestnet)}
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
ActivityTrustlinesHistory.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
