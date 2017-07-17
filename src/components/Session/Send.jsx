const React = window.React = require('react');
import AssetCard from '../AssetCard.jsx';
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
    let step1ClassName = 'Send__panel' + (step < 1 ? ' is-future' : '');
    let step2ClassName = 'Send__panel' + (step < 2 ? ' is-future' : '');
    let step3ClassName = 'Send__panel' + (step < 3 ? ' is-future' : '');
    let step4ClassName = 'Send__panel' + (step < 4 ? ' is-future' : '');

    let step1TitleClassName = 'Send__title' + (step === 1 ? ' is-active' : '');
    let step2TitleClassName = 'Send__title' + (step === 2 ? ' is-active' : '');
    let step3TitleClassName = 'Send__title' + (step === 3 ? ' is-active' : '');
    let step4TitleClassName = 'Send__title' + (step === 4 ? ' is-active' : '');

    // All the steps are in this page to reduce fragmentation

    // Step 1
    let Step1Content;
    if (step === 1) {
      Step1Content = <div className="Send__content">
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
    } else if (step > 1) {
      Step1Content = <div className="Send__content">
        <span>Account ID: <strong>{d.send.accountId}</strong></span>
      </div>
    }

    let Step1Edit;
    if (step > 1) {
      Step1Edit = <a className="Send__title__edit" onClick={d.send.handlers.step1Edit}>Edit</a>;
    }
    let Step1 = <div className={step1ClassName}>
      <h3 className={step1TitleClassName}>
        1. Destination {Step1Edit}
      </h3>
      {Step1Content}
    </div>

    // Step 2


    let Step2Content;
    if (step === 2) {
      let assetCards = _.map(d.send.step2.availableAssets, (asset, index) => {
        return <div className="row--lite">
          <div className="row__fixedAsset">
            <AssetCard asset={asset} fixed={true}></AssetCard>
          </div>
          <div className="row__shareOption">
            <a className="s-button" onClick={() => {d.send.handlers.step2PickAsset(index)}}>Send {asset.getCode()}</a>
          </div>
        </div>
      })

      Step2Content = <div className="Send__content">
        Select an asset to send. These are assets that both you and the recipient trusts.
        <div className="Send__assetPicker">
          {assetCards}
        </div>
        <div className="Send__panel__next">
        </div>
      </div>
    } else if (step > 2) {
      Step2Content = <div className="Send__content">
        <AssetCard asset={d.send.step2.asset} fixed={true}></AssetCard>
      </div>
    }
    let Step2Edit;
    if (step > 2) {
      Step2Edit = <a className="Send__title__edit" onClick={d.send.handlers.step2Edit}>Edit</a>;
    }
    let Step2 = <div className={step2ClassName}>
      <h3 className={step2TitleClassName}>
        2. Asset {Step2Edit}
      </h3>
      {Step2Content}
    </div>

    // Step 3
    let Step3Edit;
    if (step > 3) {
      Step3Edit = <a className="Send__title__edit" onClick={d.send.handlers.step3Edit}>Edit</a>;
    }
    let Step3Content;
    if (step === 3) {
      Step3Content = <div className="Send__content">
        <label className="s-inputGroup">
          <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
            <span>Amount</span>
          </span>
          <input className="s-inputGroup__item S-flexItem-share" type="text" value={d.send.step3.amount} onChange={d.send.handlers.updateAmount} placeholder="" />
        </label>
        <div className="Send__panel__next">
          <button className="s-button" onClick={d.send.handlers.step3Next}>Save and continue</button>
        </div>
      </div>
    } else if (step > 3) {
      Step3Content = <div className="Send__content">
        {d.send.step3.amount} {d.send.step2.asset.getCode()}
      </div>
    }
    let Step3 = <div className={step3ClassName}>
      <h3 className={step3TitleClassName}>
        3. Amount {Step3Edit}
      </h3>
      {Step3Content}
    </div>



    // Step 4
    let Step4Next = step !== 4 ? null : <div className="Send__panel__next">
      Note: Transactions on the Stellar network are irreversible. Please make sure all the transaction details are correct.
      <button className="s-button">Submit transaction</button>
    </div>

    let Step4 = <div className={step4ClassName}>
      <h3 className={step4TitleClassName}>
        4. Review
      </h3>
      <div className="Send__content">
        {Step4Next}
      </div>
    </div>

    return <div className="island">
      <div className="island__header">
        Send payment
      </div>
      {Step1}
      <div className="Send__separator"></div>
      {Step2}
      <div className="Send__separator"></div>
      {Step3}
      <div className="Send__separator"></div>
      {Step4}
    </div>
  }
}
