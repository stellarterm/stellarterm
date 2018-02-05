const React = window.React = require('react');
import Generic from '../Generic.jsx';
import Validate from '../../lib/Validate';
import MagicSpoon from '../../lib/MagicSpoon';
import _ from 'lodash';

export default class Inflation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: 'ready', // 'ready' | 'working'
      inflationDest: '',
      result: '', // '' | 'success' | 'error'
    }

    this.handleInput = (event) => {
      this.setState({
        inflationDest: event.target.value,
      });
    }
    this.handleSubmit = async (event) => {
      this.setState({
        status: 'working',
        result: '',
      });

      try {
        let inflationResult = await MagicSpoon.setInflation(this.props.d.Server, this.props.d.session.account, this.state.inflationDest);
        this.setState({
          status: 'ready',
          result: 'success',
        });
        this.props.d.session.account.refresh();
        setTimeout(() => {this.forceUpdate()}, 1000);
      } catch (e) {
        console.error(e);
        this.setState({
          status: 'ready',
          result: 'error',
        });
      }
    }
  }
  componentWillUnmount() {
  }
  render() {
    let d = this.props.d;
    let account = d.session.account;

    let inflationDestInfo;
    if (account.inflation_destination === undefined) {
      inflationDestInfo = <div>
        <p>You are currently <strong>not</strong> voting for any inflation destination.</p>
      </div>
    } else if (account.inflation_destination === 'GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW') {
      inflationDestInfo = <div>
        <p>You are currently voting for: <strong>{account.inflation_destination}</strong> (StellarTerm)</p>
        <div className="Generic__divider"></div>
        <h3 className="Inflation__thankYou">Thank you for voting for StellarTerm!</h3>
      </div>
    } else {
      inflationDestInfo = <div>
        <p>You are currently voting for: <strong>{account.inflation_destination}</strong></p>
      </div>
    }

    let validAddress = Validate.publicKey(this.state.inflationDest).ready;

    let submitButton;
    if (this.state.status === 'working') {
      submitButton = <button disabled={true} className="s-button">Setting inflation destination...</button>
    } else if (validAddress) {
      submitButton = <button className="s-button" onClick={(e) => {this.handleSubmit(e)}}>Set inflation destination</button>
    } else {
      submitButton = <button disabled={true} className="s-button">Set inflation destination</button>
    }

    let result;
    if (this.state.result === 'success') {
      result = <div className="s-alert s-alert--success Inflation__alert">Inflation destination successfully set!</div>;
    } else if (this.state.result === 'error') {
      result = <div className="s-alert s-alert--alert Inflation__alert">Error occured while setting inflation destination!</div>;
    }

    let state = d.send.state;
    return <div className="Inflation">
      <Generic title="Inflation in the Stellar Network">
        <p>The Stellar network has a system called "inflation" in which new coins are issued every week. Accounts can <strong>vote</strong> for which accounts get these new coins. Accounts that receive more than about 50 million XLM worth of votes get to receive inflation.</p>

        <p>Read more about <a href="https://www.stellar.org/developers/guides/concepts/inflation.html" target="_blank">inflation on the Stellar developer docs</a>.</p>

        <div className="Generic__divider"></div>
        <p>Some community members have come together to create inflation pools. You can search the web to find these inflation pools.</p>

        <p><strong>WARNING</strong>: Do not give your secret key to any inflation pools. They <strong>NEVER</strong> need your secret key for any reason. If they ask for your secret key, it is a scam trying to steal your money.</p>
      </Generic>
      <Generic title="Set your inflation destination" noTopPadding>
        {inflationDestInfo}
        <div className="Generic__divider"></div>

        <label className="s-inputGroup Inflation__inputGroup">
          <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
            <span>Inflation destination</span>
          </span>
          <input className="s-inputGroup__item S-flexItem-share" type="text" value={this.state.inflationDest} onChange={this.handleInput} placeholder="example: GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT" />
        </label>
        {submitButton}
        {result}
      </Generic>
    </div>
  }
}
