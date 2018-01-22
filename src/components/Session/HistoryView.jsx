/*
  This file contains the Effects History Component.
  This component is the parent of the Effects History
  Table Component: HistoryTable.jsx. It has checkboxes
  used to filter effects.
*/
const React = window.React = require('react');
import HistoryTable from './HistoryTable.jsx';
import Generic from '../Generic.jsx';


export default class HistoryView extends React.Component {
  constructor(props) {
    super(props);
    this.props.d.history.handlers.touch();
    this.listenId = this.props.d.history.event.listen(() => {this.forceUpdate()});
    this.state = {
        trade: true,
        account: true,
        signer: true,
        trustline: true,
    }
  }
  componentWillUnmount() {
    this.props.d.history.event.unlisten(this.listenId);
  }

  updateFilter(e) {
    this.setState({ [e.target.name] : !this.state[e.target.name]});
  }

  render() {
    // IF HISTORY IS NOT LOADED, THEN SHOW A LOADING SCREEN
    return <div>
      {<div className="so-back islandBack">
        <div className="island">
          <div className="island__header">
            <div className="HistoryView__header">
              <div className="HistoryView__header__left">Account History</div>
              <div className="HistoryView__header__right">
                Trade <input name="trade" type="checkbox" checked={this.state.trade} onChange={this.updateFilter.bind(this)} className="HistoryView_checkbox"/>
                Account <input name="account" type="checkbox" checked={this.state.account} onChange={this.updateFilter.bind(this)} className="HistoryView_checkbox"/>
                Signer <input name="signer" type="checkbox" checked={this.state.signer} onChange={this.updateFilter.bind(this)} className="HistoryView_checkbox"/>
                Trustline <input name="trustline" type="checkbox" checked={this.state.trustline} onChange={this.updateFilter.bind(this)} className="HistoryView_checkbox"/>
              </div>
            </div>
          </div>
          <HistoryTable d={this.props.d} filters={this.state}></HistoryTable>
        </div>
      </div>
      }
    </div>
  }
}
