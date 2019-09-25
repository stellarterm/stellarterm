/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { List, AutoSizer } from 'react-virtualized';
import Ellipsis from '../../../../Common/Ellipsis/Ellipsis';
import images from '../../../../../images';



export default class ActivitySignersHistory extends React.Component {
    static async goToStellarExpert(operation) {
        const { transaction_hash } = await operation();
        window.open(`https://stellar.expert/explorer/public/tx/${transaction_hash}`, '_blank');
    }

    getSignerHistoryRow(historyItem, key, style) {
        const { created_at, type, operation,
            low_threshold, med_threshold, high_threshold, public_key, weight } = historyItem;
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
        let keyWeight = weight;

        switch (type) {
        case 'account_thresholds_updated': {
            viewType = 'Thresholds updated';
            keyWeight = (<span>Low: {low_threshold} Med: {med_threshold} High: {high_threshold}</span>);
            break;
        }
        case 'signer_removed': {
            viewType = (<span className="red">Signer removed</span>);
            break;
        }
        case 'signer_created': {
            viewType = (<span className="green">Signer created</span>);
            break;
        }
        case 'signer_updated': {
            viewType = 'Signer updated';
            break;
        }
        default: break;
        }

        const viewKey = public_key ?
            `${public_key.substr(0, 24)}...${public_key.substr(-12, 12)}` : '—';


        return (
            <div key={key} style={style} className="Activity-table-row">
                <div className="Activity-table-cell">{date} at {time}</div>
                <div className="Activity-table-cell">{viewType}</div>
                <div className="Activity-table-cell">{keyWeight}</div>
                <div className="Activity-table-cell flex8">{viewKey}</div>
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
        const signersHistory = history.filter(item => (
            item.type === 'signer_removed' ||
            item.type === 'signer_created' ||
            item.type === 'signer_updated' ||
            item.type === 'account_thresholds_updated'));

        const ROW_HEIGHT = 47;
        const ListHeight = ROW_HEIGHT * signersHistory.length;

        return (
            <div className="Activity_wrap">
                <div className="Activity_header">
                    <span>Signers history({signersHistory.length}{loading && <Ellipsis />})</span>
                </div>
                <div className="Activity-table">
                    <div className="Activity-table-row head">
                        <div className="Activity-table-cell">Date/Time</div>
                        <div className="Activity-table-cell">Type</div>
                        <div className="Activity-table-cell">Key weight</div>
                        <div className="Activity-table-cell flex8">Key</div>
                        <div className="Activity-table-cell Activity-table_actions flex1" />
                    </div>
                    <div className="Activity-table-body" style={{ height: ListHeight }}>
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    width={width}
                                    height={height}
                                    rowHeight={ROW_HEIGHT}
                                    rowCount={signersHistory.length}
                                    rowRenderer={
                                        ({ key, index, style }) =>
                                            this.getSignerHistoryRow(signersHistory[index], key, style)} />
                            )}
                        </AutoSizer>
                    </div>
                </div>
            </div>
        );
    }
}
ActivitySignersHistory.propTypes = {
    history: PropTypes.arrayOf(PropTypes.any),
    loading: PropTypes.bool,
};
