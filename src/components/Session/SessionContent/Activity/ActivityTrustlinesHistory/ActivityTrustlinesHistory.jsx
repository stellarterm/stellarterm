/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { List, AutoSizer, InfiniteLoader } from 'react-virtualized';
import Driver from '../../../../../lib/Driver';
import images from '../../../../../images';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import { formatDate, ROW_HEIGHT, SCROLL_WIDTH, TABLE_MAX_HEIGHT } from './../Activity';

const TRUSTLINE_TYPES = ['trustline_removed', 'trustline_created', 'trustline_updated'];

export default class ActivityTrustlinesHistory extends React.Component {
    static async goToStellarExpert(operation) {
        const { transaction_hash } = await operation();
        window.open(`https://stellar.expert/explorer/public/tx/${transaction_hash}`, '_blank');
    }

    static filterHistoryByTrustlines(history) {
        return history.filter(item => (TRUSTLINE_TYPES.includes(item.type)));
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

    componentDidMount() {
        const history = this.constructor.filterHistoryByTrustlines(this.props.history);
        if (history.length === 0 && !this.props.isFull && !this.props.loading) {
            this.props.loadMore();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.history.length === this.props.history.length) {
            return;
        }
        const prevHistory = this.constructor.filterHistoryByTrustlines(prevProps.history);
        const currentHistory = this.constructor.filterHistoryByTrustlines(this.props.history);
        if (prevHistory.length === currentHistory.length) {
            this.props.loadMore();
        }
    }

    getTrustlinesHistoryRow(historyItem, key, style) {
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
                        onClick={() => { this.constructor.goToStellarExpert(operation).then(); }} />
                </div>
            </div>
        );
    }


    render() {
        const { history, loading } = this.props;
        const trustlineHistory = this.constructor.filterHistoryByTrustlines(history);

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
                                    loadMoreRows={(e) => {
                                        if (e.stopIndex + 40 > trustlineHistory.length) {
                                            this.props.loadMore();
                                        }
                                    }}>
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
                                                        trustlineHistory[index], key, style)} />
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
    history: PropTypes.arrayOf(PropTypes.any),
    loading: PropTypes.bool,
    loadMore: PropTypes.func,
    isFull: PropTypes.bool,
};
