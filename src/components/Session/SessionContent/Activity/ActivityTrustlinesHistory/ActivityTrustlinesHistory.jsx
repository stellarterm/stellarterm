/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { List, AutoSizer } from 'react-virtualized';
import Driver from '../../../../../lib/Driver';
import Ellipsis from '../../../../Common/Ellipsis/Ellipsis';
import images from '../../../../../images';
import AssetCardInRow from '../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';



export default class ActivityTrustlinesHistory extends React.Component {
    static async goToStellarExpert(operation) {
        const { transaction_hash } = await operation();
        window.open(`https://stellar.expert/explorer/public/tx/${transaction_hash}`, '_blank');
    }

    getTrustlinesHistoryRow(historyItem, key, style) {
        const { created_at, asset_code, asset_issuer, type, operation } = historyItem;
        const date = new Date(created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const time = new Date(created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        let viewType;
        switch (type) {
        case 'trustline_removed': {
            viewType = (<span className="red">Removed</span>);
            break;
        }
        case 'trustline_created': {
            viewType = (<span className="green">Created</span>);
            break;
        }
        case 'trustline_updated': {
            viewType = 'Updated';
            break;
        }
        default: break;
        }

        const viewIssuer = asset_issuer &&
            `${asset_issuer.substr(0, 24)}...${asset_issuer.substr(-12, 12)}`;

        return (
            <div key={key} style={style} className="Activity-table-row">
                <div className="Activity-table-cell">{date} at {time}</div>
                <div className="Activity-table-cell">{viewType}</div>
                <div className="Activity-table-cell">
                    <AssetCardInRow d={this.props.d} code={asset_code} issuer={asset_issuer} />
                </div>
                <div className="Activity-table-cell flex8">{viewIssuer}</div>
                <div className="Activity-table-cell Activity-table_actions flex1">
                    <img
                        title="stellar.expert"
                        src={images['icon-info']}
                        alt="i"
                        onClick={() => { this.constructor.goToStellarExpert(operation); }} />
                </div>
            </div>
        );
    }


    render() {
        const { history, loading } = this.props;
        const tradeHistory = history.filter(item => (
            item.type === 'trustline_removed' ||
            item.type === 'trustline_created' ||
            item.type === 'trustline_updated'));

        if (!loading && tradeHistory.length === 0) {
            return (
              <div className="Activity_empty">You have no trustlines history</div>
            );
        }

        const ROW_HEIGHT = 47;
        const ListHeight = ROW_HEIGHT * tradeHistory.length;


        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>Trustlines history({tradeHistory.length}{loading && <Ellipsis />})</span>
                </div>

                <div className="Activity-table">
                    <div className="Activity-table-row head">
                        <div className="Activity-table-cell">Date/Time</div>
                        <div className="Activity-table-cell">Type</div>
                        <div className="Activity-table-cell">Asset</div>
                        <div className="Activity-table-cell flex8">Issuer</div>
                        <div className="Activity-table-cell Activity-table_actions flex1" />
                    </div>
                    <div className="Activity-table-body" style={{ height: ListHeight }}>
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    width={width}
                                    height={height}
                                    rowHeight={ROW_HEIGHT}
                                    rowCount={tradeHistory.length}
                                    rowRenderer={
                                        ({ key, index, style }) =>
                                            this.getTrustlinesHistoryRow(tradeHistory[index], key, style)} />
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
};
