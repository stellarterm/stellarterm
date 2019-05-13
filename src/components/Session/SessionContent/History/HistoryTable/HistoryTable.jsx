import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';
import { niceDate } from '../../../../../lib/Format';
import HistoryTableRow from './HistoryTableRow/HistoryTableRow';
import Ellipsis from '../../../../Common/Ellipsis/Ellipsis';
import Loading from '../../../../Common/Loading/Loading';

export default class HistoryTable extends React.Component {
    getHistoryRows() {
        const spoonHistory = this.props.d.history.spoonHistory;

        return spoonHistory.records.map((record) => {
            const details = spoonHistory.details[record.id];

            if (this.filterDisabled(record, details)) {
                return null;
            }

            const operationType = details.category.split('_')[0];
            const { date, time, timezone } = niceDate(details.created_at);

            return (
                <tr className="HistoryTable__row" key={details.id}>
                    <td className="HistoryTable__row__item--description">
                        <HistoryTableRow type={operationType} data={details} />
                    </td>

                    <td className="HistoryTable__row__item--date">
                        <div className="DateCard">
                            <div className="DateCard__date">
                                {date}
                                <br />
                                {time}
                                <br />
                                {timezone}
                            </div>
                            <div className="DateCard__ledger">Ledger #{details.ledger_attr}</div>
                        </div>
                    </td>
                </tr>
            );
        }).filter(asset => asset !== null);
    }

    filterDisabled(record, details) {
        const { filters } = this.props;

        const detailsIsUndefined = details === undefined;
        const filterText = record.type.split('_')[0];
        const isFilterDisabled = !filters[filterText];

        const nothingToDisplay = detailsIsUndefined || isFilterDisabled;

        return nothingToDisplay;
    }

    render() {
        const spoonHistory = this.props.d.history.spoonHistory;
        const historyNotLoaded = spoonHistory === null;

        if (historyNotLoaded) {
            return (
                <Loading size="large">
                    Loading transaction history
                    <Ellipsis />
                </Loading>
            );
        }

        const historyRows = this.getHistoryRows(spoonHistory);
        const loadedRecords = historyRows.length;
        const totalRecords = spoonHistory.records.length;

        return (
            <table className="HistoryTable">
                <thead>
                    <tr className="HistoryTable__head">
                        <td className="HistoryTable__head__cell HistoryTable__head__description">Description</td>
                        <td className="HistoryTable__head__cell HistoryTable__head__date">Date</td>
                    </tr>
                </thead>

                <tbody className="HistoryTable__body">
                    {historyRows}

                    <tr className="HistoryTable__row HistoryTable__row__loading" key={'loading'}>
                        <td>
                            Loaded ({loadedRecords}/{totalRecords})
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

HistoryTable.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    filters: PropTypes.objectOf(PropTypes.bool).isRequired,
};
