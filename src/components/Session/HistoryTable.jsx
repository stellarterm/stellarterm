/*
  This file contains the Effects History Table Component.
  This component displays relevant information about
  all the effects of an account in descending chronological order.
  It is meant to be visual, concise, scanable, minimal, and
  clean, with four columns:
  1) Effect type
  2) Action (ie CREATE for account_create)
  3) Description
  4) Date (absolute time, date, and ledger sequence number)
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

    const effectsRows = spoonHistory.records.map(record => {
      let details = spoonHistory.details[record.id];
      if (details === undefined) {
        return;
      }

      const effectType = details.category.split('_')[0];
      const niceDateObj = niceDate(details.created_at);

      return <tr className="HistoryTable__row" key={details.id}>
        <td className="HistoryTable__row__item--category">
          <div className="HistoryTable__category">{effectType.toUpperCase()}</div>
        </td>
        <td className="HistoryTable__row__item--action">
          {
            // For trade, the type is simply trade, thus, details.category.split("_")[1] does not exist.
            // So, here we maunally create the sub action that will be displayed.
            // For the rest, details.category.split("_")[1] is the sub action (ie for account_created --> created)
            effectType === 'trade' ? 'traded' : details.category.split("_")[1] || details.category.split("_")[1].toUpperCase()
          }
        </td>
          <td className="HistoryTable__row__item--description">
            <HistoryTableRow type={effectType} data={details}/>
          </td>
          <td className="HistoryTable__row__item--date">
            <div className="DateCard">
              <div className="DateCard__date">
                  {niceDateObj.date}
                  <br />
                  {niceDateObj.time}
              </div>
              <div className="DateCard__ledger">
                  Ledger #{details.ledger_attr}
              </div>
            </div>
          </td>
      </tr>
    });

    return (
      <table className="HistoryTable">
        <thead>
          <tr className="HistoryTable__head">
            <td className="HistoryTable__head__cell HistoryTable__head__category">Category</td>
            <td className="HistoryTable__head__cell HistoryTable__head__action">Action</td>
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
