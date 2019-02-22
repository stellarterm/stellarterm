/*
  This file contains the Effects History Table Component.
  This component displays relevant information about all the effects of an account in descending chronological order.
  It is meant to be visual, concise, scanable, minimal, and clean, with two columns:
  1) Description
  2) Date (date, absolute time, and ledger sequence number)
*/
import React from 'react';
import PropTypes from 'prop-types';
import HistoryTableRow from './HistoryTableRow';
import Loading from '../Loading';
import Ellipsis from '../Ellipsis';
import { niceDate } from '../../lib/Format';
import Driver from '../../lib/Driver';

export default class HistoryTable extends React.Component {
    getHistoryRows() {
        const spoonHistory = this.props.d.history.spoonHistory;
        const historyRows = [];

        spoonHistory.records.map((record) => {
            const details = spoonHistory.details[record.id];

            const detailsIsUndefined = details === undefined;
            const allFiltersDisabled = !this.props.filters[record.type.split('_')[0]];

            const nothingToDisplay = detailsIsUndefined || allFiltersDisabled;
            if (nothingToDisplay) { return null; }

            const operationType = details.category.split('_')[0];
            const { date, time, timezone } = niceDate(details.created_at);

            historyRows.push(
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
                </tr>,
            );
            return null;
        });

        return historyRows;
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
        const totalRecords = spoonHistory.records.length;
        const loadedRecords = historyRows.length;

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
