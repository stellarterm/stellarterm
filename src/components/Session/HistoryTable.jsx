/*
  This file contains the Effects History Table Component.
  This component displays relevant information about
  all the effects of an account in descending chronological order.
  It is meant to be visual, concise, scanable, minimal, and
  clean, with four catagories:
  1) Effect type
  2) Sub action (ie CREATE for account_create)
  3) Description
  4) Date (time since and ledger sequence number)
*/
const React = window.React = require('react');
import EffectCard from './EffectCard.jsx';
import DateCard from './DateCard.jsx';
import {daysSince} from '../../lib/Format';

export default class HistoryTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let account = this.props.d.session.account;

    // From MagicSpoon.Account
    let allEffects = account.effectHistory;

    // Filter the checkboxes to only get the "checked" ones
    let filtered = Object.keys(this.props.filters).filter( x => this.props.filters[x]);

    // Filter the effects according to the checkboxes
    // x.category.split("_")[0] is the type of the effect (ie for account_created --> account)
    allEffects = allEffects.filter( x => filtered.indexOf(x.category.split("_")[0]) !== -1 );

    const effectsRows = allEffects.map(effect => {

      const effectType = effect.category.split("_")[0];
      const effectCard = <EffectCard type={effectType} data={effect}/>

      return <tr className="HistoryTable__row" key={effect.id}>
        <td className="HistoryTable__row__item--category">
          <div className="HistoryTable__category">{effectType.toUpperCase()}</div>
        </td>
        <td className="HistoryTable__row__item--action">
          {
            // For trade, the type is simply trade, thus, effect.category.split("_")[1] does not exist.
            // So, here we maunally create the sub action that will be displayed.
            // For the rest, effect.category.split("_")[1] is the sub action (ie for account_created --> created)
            effectType === 'trade' ? 'TRADED' : effect.category.split("_")[1] ? effect.category.split("_")[1].toUpperCase() : ""
          }
        </td>
          <td className="HistoryTable__row__item--description">
            {effectCard}
          </td>
          <td className="HistoryTable__row__item--date">
            <DateCard time={daysSince(effect.created_at)} ledger={effect.ledger_attr}/>
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
