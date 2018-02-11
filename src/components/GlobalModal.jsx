const React = window.React = require('react');
import TransactionSummary from './TransactionSummary.jsx';
import SignWithLedgerModal from './SignWithLedgerModal.jsx';

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
    console.error(error);
    this.setState({
    });
  }

  render() {
    let d = this.props.d;
    let modal = d.modal;
    let body;


    if (modal.modalName === 'sign') {
      let laboratoryContent;
      if (d.session.account.inflation_destination === 'GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW') {
        laboratoryContent = <div className="GlobalModal__content">
          <a href={'https://www.stellar.org/laboratory/#txsigner?xdr=' + encodeURI(modal.inputData.toEnvelope().toXDR('base64')) + '&network=public'} target="_blank" rel="nofollow noopener noreferrer">View in Stellar Laboratory</a>
        </div>
      }
      // To get tx xdr: modal.inputData.toEnvelope().toXDR('base64')
      body = <div className="GlobalModal">
        <div className="GlobalModal__header">
          Sign transaction
        </div>
        <div className="GlobalModal__content">
          <TransactionSummary tx={modal.inputData}></TransactionSummary>
        </div>
        {laboratoryContent}
        <div className="GlobalModal__navigation">
          <button className="s-button s-button--light" onClick={() => {d.modal.handlers.cancel()}}>Cancel</button>
          <button className="s-button" onClick={() => {d.modal.handlers.finish()}}>Sign</button>
        </div>
      </div>
    } else if (modal.modalName === 'signWithLedger') {
      body = <SignWithLedgerModal d={d} />
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
