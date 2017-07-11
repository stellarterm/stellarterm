const React = window.React = require('react');
import _ from 'lodash';

export default class Send extends React.Component {
  constructor(props) {
    super(props);
    this.listenId = this.props.d.listenSend(() => {
      this.forceUpdate();
    });
  }
  componentWillUnmount() {
    this.props.d.unlistenSend(this.listenId);
  }
  render() {
    let d = this.props.d;
    let step = this.props.d.send.step;
    let step1ClassName = 'Send__panel' + (step === 1 ? '' : ' is-inactive');
    let step2ClassName = 'Send__panel' + (step === 2 ? '' : ' is-inactive');
    let step3ClassName = 'Send__panel' + (step === 3 ? '' : ' is-inactive');
    let step4ClassName = 'Send__panel' + (step === 4 ? '' : ' is-inactive');

    return <div className="island">
      <div className="island__header">
        Send payment
      </div>
      <div className={step1ClassName}>
        <h3 className="Send__title">
          1. Select destination<a className="Send__title__edit">Edit</a>
        </h3>
        <div className="Send__content">
          <label className="s-inputGroup">
            <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
              <span>Account ID</span>
            </span>
            <input className="s-inputGroup__item S-flexItem-share" type="text" value={d.send.accountId} onChange={d.send.handlers.updateAccountId} placeholder="" />
          </label>
          <div className="Send__panel__next">
            <button className="s-button" onClick={d.send.handlers.step1Next}>Save and continue</button>
          </div>
        </div>
      </div>
      <div className="Send__separator"></div>
      <div className={step2ClassName}>
        <h3 className="Send__title">
          2. Select asset
        </h3>
        Lumens
      </div>
      <div className="Send__separator"></div>
      <div className={step3ClassName}>
        <h3 className="Send__title">
          3. Select amount
        </h3>
        <div className="Send__content">
          <label className="s-inputGroup">
            <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
              <span>Amount</span>
            </span>
            <input className="s-inputGroup__item S-flexItem-share" type="text" value={""} onChange={() => {}} placeholder="" />
          </label>
        </div>
      </div>
      <div className="Send__separator"></div>
      <div className={step4ClassName}>
        <h3 className="Send__title">
          4. Review
        </h3>
        <div className="Send__content">
          Please finish the previous steps first.
          <div className="Send__panel__next">
            <button className="s-button">Submit transaction</button>
          </div>
        </div>
      </div>
    </div>
  }
}
