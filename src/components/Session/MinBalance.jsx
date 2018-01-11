const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';
import BalancesTable from './BalancesTable.jsx';
import _ from 'lodash';

export default class MinBalance extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let explanation = this.props.d.session.account.explainReserve();
    let minBalanceRows = _.map(explanation.items, (item, index) => {
      return <tr key={index}>
        <td className="MinBalance__table__type">{item.entryType}</td>
        <td>{item.amount}</td>
        <td className="MinBalance__table__lumens">{item.XLM}</td>
      </tr>
    })
    minBalanceRows.push(<tr key={-1} className="MinBalance__table__total">
      <td className="MinBalance__table__type"><strong>Total</strong></td>
      <td></td>
      <td className="MinBalance__table__lumens"><strong>{explanation.totalLumens}</strong></td>
    </tr>);

    return <div>
    <div className="island__sub">
      <div className="island__sub__division MinBalance__sub">
        <p>The Stellar network requires accounts to maintain a <a href="https://www.stellar.org/developers/guides/concepts/fees.html#minimum-account-balance">minimum balance</a>. A 1 XLM minimum balance is required with an additional requirement 0.5 XLM for each entry in the account such as a trustline or offer. You can read more about this on the <a href="https://www.stellar.org/developers/guides/concepts/fees.html#minimum-account-balance">Stellar developer docs</a></p>
        <p>Each entry (asset accepted, offer, signer) increases your minimum balance by 0.5 XLM. Additionally, StellarTerm enforces a 0.1 XLM of extra minimum balance in an attempt to make sure your account can still make transactions without going below the network minimum balance requirements.</p>
        <p><strong>To decrease your minimum balance</strong>, you can remove an existing offer or <a href="#account/addTrust">unaccept an asset</a>.</p>
      </div>
      <div className="island__sub__division MinBalance__sub MinBalance__sub--table">
        <table className="MinBalance__table">
          <thead className="MinBalance__table__head">
            <tr>
              <td className="MinBalance__table__type">Entry type</td>
              <td>#</td>
              <td className="MinBalance__table__lumens">XLM</td>
            </tr>
          </thead>
          <tbody>
            {minBalanceRows}
          </tbody>
        </table>
      </div>
    </div>

    </div>
  }
}
