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
    this.updateFilter = (name) => {
      this.setState({ [name] : !this.state[name]});
    }
  }
  componentWillUnmount() {
    this.props.d.history.event.unlisten(this.listenId);
  }



  render() {
    // IF HISTORY IS NOT LOADED, THEN SHOW A LOADING SCREEN

    let toggles = <div className="s-buttonGroup HistoryView__header__right__buttonGroup">
      <button className={"s-button s-button--light" + (this.state.trade ? ' is-active' : '')} onClick={() => {this.updateFilter('trade')}}>Trade</button>
      <button className={"s-button s-button--light" + (this.state.account ? ' is-active' : '')} onClick={() => {this.updateFilter('account')}}>Account</button>
      <button className={"s-button s-button--light" + (this.state.signer ? ' is-active' : '')} onClick={() => {this.updateFilter('signer')}}>Signer</button>
      <button className={"s-button s-button--light" + (this.state.trustline ? ' is-active' : '')} onClick={() => {this.updateFilter('trustline')}}>Trustline</button>
    </div>


    // <label>Trade <input name="trade" type="checkbox" checked={this.state.trade} onChange={this.updateFilter.bind(this)} className="HistoryView_checkbox"/></label>
    // <label>Account <input name="account" type="checkbox" checked={this.state.account} onChange={this.updateFilter.bind(this)} className="HistoryView_checkbox"/></label>
    // <label>Signer <input name="signer" type="checkbox" checked={this.state.signer} onChange={this.updateFilter.bind(this)} className="HistoryView_checkbox"/></label>
    // <label>Trustline <input name="trustline" type="checkbox" checked={this.state.trustline} onChange={this.updateFilter.bind(this)} className="HistoryView_checkbox"/></label>


    return <div>
      {<div className="so-back islandBack islandBack--t">
        <div className="island">
          <div className="island__header">
            <div className="HistoryView__header">
              <div className="HistoryView__header__left">Account History</div>
              <div className="HistoryView__header__right">
                <span className="HistoryView__header__right__label">Filter: </span>{toggles}
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
