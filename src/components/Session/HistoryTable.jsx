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
import {niceDate} from '../../lib/Format';

export default class HistoryTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let allEffects = this.props.d.session.filteredEffectHistory;

    const effectsRows = allEffects.map(effect => {

      const effectType = effect.category.split("_")[0];
      const niceDateObj = niceDate(effect.created_at);

      return <tr className="HistoryTable__row" key={effect.id}>
        <td className="HistoryTable__row__item--category">
          <div className="HistoryTable__category">{effectType.toUpperCase()}</div>
        </td>
        <td className="HistoryTable__row__item--action">
          {
            // For trade, the type is simply trade, thus, effect.category.split("_")[1] does not exist.
            // So, here we maunally create the sub action that will be displayed.
            // For the rest, effect.category.split("_")[1] is the sub action (ie for account_created --> created)
            effectType === 'trade' ? 'traded' : effect.category.split("_")[1] || effect.category.split("_")[1].toUpperCase()
          }
        </td>
          <td className="HistoryTable__row__item--description">
            <HistoryTableRow type={effectType} data={effect}/>
          </td>
          <td className="HistoryTable__row__item--date">
            <div className="DateCard">
              <div className="DateCard__date">
                  {niceDateObj.time}<br />
                  {niceDateObj.date}
              </div>
              <div className="DateCard__ledger">
                  Ledger #{effect.ledger_attr}
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
