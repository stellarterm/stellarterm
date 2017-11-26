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
  constructor(props) {
    super(props);
    this.state = {
      trade: true,
      account: true,
      signer: true,
      trustline: true,
    }
  }

  // Handles toggling of checkboxes on click and
  // modifies the local state accordingly.
  clickhandler(e) {
    switch(e.target.name) {
      case 'trade':
        this.setState({ trade: !this.state.trade })
        break;
      case 'account':
        this.setState({ account: !this.state.account })
        break;
      case 'signer':
        this.setState({ signer: !this.state.signer })
        break;
      case 'trustline':
        this.setState({ trustline: !this.state.trustline })
        break;
    }
  }

  render() {
    return <div>
      <div className="so-back islandBack">
        <div className="island">
          <div className="island__header">
            <div className="HistoryView__header">
              <div className="HistoryView__header__left">Account History</div>
              <div className="HistoryView__header__right">
                Trade <input name="trade" type="checkbox" checked={this.state.trade} onChange={this.clickhandler.bind(this)} className="HistoryView_checkbox"/>
                Account <input name="account" type="checkbox" checked={this.state.account} onChange={this.clickhandler.bind(this)} className="HistoryView_checkbox"/>
                Signer <input name="signer" type="checkbox" checked={this.state.signer} onChange={this.clickhandler.bind(this)} className="HistoryView_checkbox"/>
                Trustline <input name="trustline" type="checkbox" checked={this.state.trustline} onChange={this.clickhandler.bind(this)} className="HistoryView_checkbox"/>
              </div>
            </div>
          </div>
          <HistoryTable d={this.props.d} filters={this.state}></HistoryTable>
        </div>
      </div>
    </div>
  }
}
