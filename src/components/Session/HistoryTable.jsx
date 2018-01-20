/*
  This file contains the Effects History Table Component.
  This component displays relevant information about
  all the effects of an account in descending chronological order.
  It is meant to be visual, concise, scanable, minimal, and
  clean, with two columns:
  1) Description
  2) Date (date, absolute time, and ledger sequence number)
*/
const React = window.React = require('react');
import HistoryTableRow from './HistoryTableRow.jsx';
import Loading from '../Loading.jsx';
import {niceDate} from '../../lib/Format';

export default class HistoryTable extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let spoonHistory = this.props.d.history.spoonHistory;

    if (spoonHistory === null) {
      return <Loading size="large">Loading transaction history...</Loading>
    }

    let amountLoaded = 0;
    const effectsRows = spoonHistory.records.map(record => {
      let details = spoonHistory.details[record.id];
      if ((details === undefined) || (!this.props.filters[record.type.split("_")[0]])) {
        return;
      }

      const effectType = details.category.split('_')[0];
      const niceDateObj = niceDate(details.created_at);
      amountLoaded += 1;

      return <tr className="HistoryTable__row" key={details.id}>
          <td className="HistoryTable__row__item--description">
            <HistoryTableRow type={effectType} data={details}/>
          </td>
          <td className="HistoryTable__row__item--date">
            <div className="DateCard">
              <div className="DateCard__date">
                  {niceDateObj.date}
                  <br />
                  {niceDateObj.time}
                  <br />
                  {niceDateObj.timezone}
              </div>
              <div className="DateCard__ledger">
                  Ledger #{details.ledger_attr}
              </div>
            </div>
          </td>
      </tr>
    });

    let totalRecords = spoonHistory.records.length;

    effectsRows.push(<tr className="HistoryTable__row HistoryTable__row__loading" key={'loading'}>
      <td>Loading ({amountLoaded}/{totalRecords})</td>
    </tr>)

    return (
      <table className="HistoryTable">
        <thead>
          <tr className="HistoryTable__head">
            <td className="HistoryTable__head__cell HistoryTable__head__description">Description</td>
            <td className="HistoryTable__head__cell HistoryTable__head__date">Date</td>
          </tr>
        </thead>
        <tbody className="HistoryTable__body">
          {effectsRows}
        </tbody>
      </table>
    )
  }
}
