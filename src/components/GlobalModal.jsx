const React = window.React = require('react');
import TransactionSummary from './TransactionSummary.jsx';

export default class GlobalModal extends React.Component {
  constructor(props) {
    super(props);
    this.unsub = this.props.d.modal.event.sub(() => {this.forceUpdate()});
    this.state = {
    };
  }
  componentWillUnmount() {
    this.unsub();
  }

  componentDidCatch(error, info) {
    this.setState({
    });
  }

  render() {
    let d = this.props.d;
    let modal = d.modal;
    let body;


    if (modal.modalName === 'sign') {
      // To get tx xdr: modal.inputData.toEnvelope().toXDR('base64')
      // Showing raw xdr is kinda scary to users though

      let ops = [];
      console.log(modal.inputData.operations)
      body = <div className="GlobalModal">
        <div className="GlobalModal__header">
          Sign transaction
        </div>
        <div className="GlobalModal__content">
          <TransactionSummary tx={modal.inputData}></TransactionSummary>
        </div>
        <div className="GlobalModal__navigation">
          <button className="s-button s-button--light" onClick={() => {d.modal.handlers.cancel()}}>Cancel</button>
          <button className="s-button" onClick={() => {d.modal.handlers.finish()}}>Sign</button>
        </div>
      </div>
    } else {
      body = <div className="GlobalModal">
        <div className="GlobalModal__content">
          Error: missing modal {modal.modalName}
        </div>
        <div className="GlobalModal__navigation">
          <button className="s-button s-button--light" onClick={() => {d.modal.handlers.cancel()}}>Cancel</button>
        </div>
      </div>
    }

    return <div className={'GlobalModalBackdrop' + (d.modal.active ? '' : ' is-hidden')}>
      {body}
    </div>
  }
}
