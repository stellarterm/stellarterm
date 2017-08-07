const React = window.React = require('react');
import AssetCard from '../AssetCard.jsx';
import Stellarify from '../../lib/Stellarify';
import Validate from '../../lib/Validate';
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

    let state = d.send.state;

    if (state === 'setup') {
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
        let accountIdValid = Validate.publicKey(d.send.accountId);
        let destinationValidationMessage;
        if (accountIdValid === false) {
          destinationValidationMessage = <p>Account ID is invalid</p>
        }

        let memoContentInput;

        if (d.send.memoType !== 'none') {
          let memoPlaceholder;
          switch (d.send.memoType) {
            case 'MEMO_ID':
              memoPlaceholder = 'Memo ID number';
              break;
            case 'MEMO_TEXT':
              memoPlaceholder = 'Up to 28 bytes of text';
              break;
            case 'MEMO_HASH':
            case 'MEMO_RETURN':
              memoPlaceholder = '64 character hexadecimal encoded string';
              break;
          }
          memoContentInput = <label className="s-inputGroup">
            <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
              <span>Memo content</span>
            </span>
            <input className="s-inputGroup__item S-flexItem-share" type="text" value={d.send.memoContent} onChange={d.send.handlers.updateMemoContent} placeholder={memoPlaceholder}/>
          </label>
        }

        Step1Content = <div className="Send__content">
          <label className="s-inputGroup">
            <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
              <span>Account ID</span>
            </span>
            <input className="s-inputGroup__item S-flexItem-share" type="text" value={d.send.accountId} onChange={d.send.handlers.updateAccountId} placeholder="example: GC4DJYMFQZVX3R56FVCN3WA7FJFKT24VI67ODTZUENSE4YNUXZ3WYI7R" />
          </label>
          {destinationValidationMessage}
          <label className="s-inputGroup">
            <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
              <span>Memo type (optional)</span>
            </span>
            <span className="so-dropdown s-inputGroup__item S-flexItem-noFlex">
              <select value={d.send.memoType} onChange={d.send.handlers.updateMemoType} className="so-dropdown__select">
                <option>none</option>
                <option>MEMO_ID</option>
                <option>MEMO_TEXT</option>
                <option>MEMO_HASH</option>
                <option>MEMO_RETURN</option>
              </select>
            </span>
          </label>
          {memoContentInput}
          <div className="Send__panel__next">
            <button className="s-button" disabled={!accountIdValid} onClick={d.send.handlers.step1Next}>Save and continue</button>
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
          return <div className="row--lite" key={Stellarify.assetToSlug(asset)}>
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
      let amountValid = Validate.amount(d.send.step3.amount);
      let amountValidationMessage;
      if (amountValid === false) {
        amountValidationMessage = <p>Amount is invalid</p>
      }
      console.log('amountValid',amountValid)
      if (step === 3) {
        Step3Content = <div className="Send__content">
          <label className="s-inputGroup">
            <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
              <span>Amount</span>
            </span>
            <input className="s-inputGroup__item S-flexItem-share" type="text" value={d.send.step3.amount} onChange={d.send.handlers.updateAmount} placeholder="" />
          </label>
          {amountValidationMessage}
          <div className="Send__panel__next">
            <button className="s-button" disabled={!amountValid} onClick={d.send.handlers.step3Next}>Save and continue</button>
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
        <button className="s-button" onClick={d.send.handlers.submit}>Submit transaction</button>
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
    } else if (state === 'pending') {
      return <div className="island">
        <div className="island__header">
          Send Payment
        </div>
        Submitting transaction...
      </div>
    } else if (state === 'success') {
      return <div className="island">
        <div className="island__header">
          Send Payment
        </div>
        <h3 className="Send__title">Success!</h3>

        Transaction ID: <a target="_blank" href={'https://horizon.stellar.org/transactions/' + d.send.txId}>{d.send.txId}</a>
        <br /><br />
        <button className="s-button" onClick={d.send.handlers.reset}>Start over</button>
      </div>
    } else { // state is error
      return <div className="island">
        <div className="island__header">
          Send Payment
        </div>
        <h3 className="Send__title">Error</h3>
        <pre>
          {d.send.errorDetails}
        </pre>
        <br /><br />
        <button className="s-button" onClick={d.send.handlers.reset}>Start over</button>
      </div>
    }
  }
}
