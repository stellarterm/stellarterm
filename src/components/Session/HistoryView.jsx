/*
  This file contains the Effects History Component.
  This component is the parent of the Effects History
  Table Component: HistoryTable.jsx. It also has
  checkboxes used to filter effects. These are
  managed by a local state.
*/
const React = window.React = require('react');
import HistoryTable from './HistoryTable.jsx';

export default class HistoryView extends React.Component {
  render() {
    return <div>
      <div className="so-back islandBack">
        <div className="island">
          <div className="island__header">
            <div className="HistoryView__header">
              <div className="HistoryView__header__left">Account History</div>
              <div className="HistoryView__header__right">
                Trade <input name="trade" type="checkbox" checked={this.props.d.session.filters.trade} onChange={this.props.d.handlers.filterHistory.bind(this)} className="HistoryView_checkbox"/>
                Account <input name="account" type="checkbox" checked={this.props.d.session.filters.account} onChange={this.props.d.handlers.filterHistory.bind(this)} className="HistoryView_checkbox"/>
                Signer <input name="signer" type="checkbox" checked={this.props.d.session.filters.signer} onChange={this.props.d.handlers.filterHistory.bind(this)} className="HistoryView_checkbox"/>
                Trustline <input name="trustline" type="checkbox" checked={this.props.d.session.filters.trustline} onChange={this.props.d.handlers.filterHistory.bind(this)} className="HistoryView_checkbox"/>
              </div>
            </div>
          </div>
          <HistoryTable d={this.props.d}></HistoryTable>
        </div>
      </div>
    </div>
  }
}
