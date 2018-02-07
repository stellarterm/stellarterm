const React = window.React = require('react');
import TransactionSummary from './TransactionSummary.jsx';
import MagicSpoon from '../lib/MagicSpoon';
const images = require('../images');

export default class GlobalModal extends React.Component {
  constructor(props) {
    super(props);
    this.unsubModal = this.props.d.modal.event.sub(() => {this.forceUpdate()});
    this.unsubSession = this.props.d.session.event.sub(() => {this.forceUpdate()});
    this.state = {};
  }
  componentDidMount() {
    this.props.d.session.account.signWithLedger(this.props.d.modal.inputData)
    .then(result => {
      this.props.d.modal.handlers.finish(result);
    })
    .catch(error => {
      if (error.message === 'Transaction approval request was rejected') {
        this.props.d.modal.handlers.cancel(error.message);
      } else {
        this.setState({
          error: error.message,
        })
      }
    })
  }
  componentWillUnmount() {
    this.unsubModal();
    this.unsubSession();
  }

  render() {
    let d = this.props.d;
    if (this.state.error) {
      return <div className="GlobalModal">
        <div className="GlobalModal__header">
          Transaction signing failed
        </div>
        <div className="GlobalModal__content">
          The transaction could not be signed. Try restarting your Ledger and refreshing this webpage.
          <br />
          Error: {this.state.error}
        </div>
        <div className="GlobalModal__navigation">
          <div></div><button className="s-button s-button--light" onClick={() => {d.modal.handlers.cancel()}}>OK</button>
        </div>
      </div>
    }

    return <div className="GlobalModal">
      <div className="GlobalModal__header">
        Sign transaction with your Ledger
      </div>
      <div className="GlobalModal__content">
        <img src={images['ledger-logo']} className="img--noSelect" alt="Ledger Logo" width="150" height="40" />
        <TransactionSummary tx={d.modal.inputData}></TransactionSummary>
      </div>
      <div className="GlobalModal__content">
        Action required: <strong>Confirm transaction</strong> on your Ledger device. ✔<br />
      </div>
      <div className="GlobalModal__navigation">
        <button className="s-button s-button--light" onClick={() => {d.modal.handlers.cancel()}}>Cancel</button>
        <span>Waiting for your confirmation</span>
      </div>
    </div>
  }
}
