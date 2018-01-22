const React = window.React = require('react');
import Stellarify from '../lib/Stellarify';
import Printify from '../lib/Printify';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import PropTypes from 'prop-types';

// OfferMaker is an uncontrolled element (from the perspective of its users)
export default class OfferMaker extends React.Component {
  initialize() {
    if (!this.initialized) {
      this.initialized = true;
      let state = {};

      // Initialize price
      if (this.props.side === 'buy' && this.props.d.orderbook.bids.length > 0) {
        state.price = new BigNumber(this.props.d.orderbook.bids[0].price).toString() // Get rid of extra 0s
      } else if (this.props.d.orderbook.asks.length > 0) { // Proptypes validation makes sure this is sell
        state.price = new BigNumber(this.props.d.orderbook.asks[0].price).toString() // Get rid of extra 0s
      }

      state.errorType = '';

      return state;
    }
    return {};
  }
  capDigits(input) {
    try {
      return new BigNumber(input).toFixed(7).toString();
    } catch (e) {
      return input;
    }
  }
  componentWillUnmount() {
    // this.props.d.unlistenSession(this.listenSessionId);
    // TODO: fix the unlistening
    this.props.d.unlistenOrderbook(this.listenOrderbookId);
    this.props.d.unlistenOrderbook(this.listenOrderbookPricePickId);
  }
  constructor(props) {
    super(props);
    this.initialized = false;

    this.listenSessionId = props.d.listenSession(() => {
      this.forceUpdate();
    });

    this.listenOrderbookId = props.d.listenOrderbook(() => {
      this.setState(this.initialize());
      this.forceUpdate();
    });

    this.listenOrderbookPricePickId = this.props.d.listenOrderbookPricePick(opts => {
      this.updateState('price', opts.price);
    });

    this.state = {
      valid: false,
      price: '', // Most sticky item (since the price is pretty static)
      amount: '',

      // Total = price * amount
      total: '',
      buttonState: 'ready', // ready or pending
      errorMessage: false,
      successMessage: '',
    };

    if (this.props.d.orderbook.ready) {
      this.state = Object.assign(this.state, this.initialize());
    }

    // TODO: Limit the number of digits after the decimal that can be input
    this.updateState = (item, value) => {
      let state = Object.assign(this.state, {
        // Reset messages
        successMessage: '',
        errorMessage: false,
      });
      state.valid = false;
      if (item == 'price') {
        state.price = value;
      } else if (item == 'amount') {
        state.amount = value;
      } else if (item == 'total') {
        state.total = value;
      } else {
        throw new Error('Invalid item type');
      }

      try {
        // If there is an error, we will just let the user input change but not the affected inputs
        if (item == 'price') {
          state.total = new BigNumber(new BigNumber(value).times(new BigNumber(state.amount)).toFixed(7)).toString();
        } else if (item == 'amount') {
          state.total = new BigNumber(new BigNumber(value).times(new BigNumber(state.price)).toFixed(7)).toString();
        } else if (item == 'total') {
          state.amount = new BigNumber(new BigNumber(value).dividedBy(new BigNumber(state.price)).toFixed(7)).toString();
        } else {
          throw new Error('Invalid item type');
        }

        // TODO: truer valid
        state.valid = true;
      } catch(e) {
        // Invalid input somewhere
      }
      this.setState(state);
    }

    this.handleSubmit = (e) => {
      // TODO: Hook up with driver
      e.preventDefault();
      props.d.handlers.createOffer(props.side, {
        price: this.state.price,
        amount: this.state.amount,
        total: this.state.total,
      })
      .then(result => {
        this.setState({
          buttonState: 'ready',
          successMessage: 'Offer successfully created',
        })
      })
      .catch(result => {
        let errorType;
        console.log(result)
        try {
          if (result.data.extras.result_codes.operations[0] === 'buy_not_authorized') {
            errorType = 'buyNotAuthorized';
          } else if (result.data.extras.result_codes.operations[0] === 'op_low_reserve') {
            errorType = 'lowReserve';
          } else {
            errorType = result.data.extras.result_codes.operations[0];
          }
        } catch(e) {
          console.error(e)
          errorType = 'unknownResponse';
        }
        this.setState({
          buttonState: 'ready',
          errorMessage: true,
          errorType,
        })
      })

      this.setState({
        valid: false,
        buttonState: 'pending',
        amount: '',
        total: '',
        successMessage: '',
        errorMessage: false,
      });
    }
  }
  render() {
    if (!this.props.d.orderbook.ready) {
      return <div>Loading</div>;
    }

    let capitalizedSide = 'Buy';
    if (this.props.side === 'sell') {
      capitalizedSide = 'Sell';
    }

    let baseAssetName = this.props.d.orderbook.baseBuying.getCode();
    let counterAssetName = this.props.d.orderbook.counterSelling.getCode();

    let title;
    if (this.props.side === 'buy') {
      title = `Buy ${baseAssetName} using ${counterAssetName}`;
    } else {
      title = `Sell ${baseAssetName} for ${counterAssetName}`;
    }

    let youHave;
    let hasAllTrust = false;
    let insufficientBalanceMessage;
    if (this.props.d.session.state === 'in') {
      let baseBalance = this.props.d.session.account.getBalance(this.props.d.orderbook.baseBuying);
      let counterBalance = this.props.d.session.account.getBalance(this.props.d.orderbook.counterSelling);

      if (baseBalance !== null && counterBalance !== null) {
        hasAllTrust = true;
      }
      let targetBalance = this.props.side === 'buy' ? counterBalance : baseBalance;
      let targetAsset = this.props.side === 'buy' ? this.props.d.orderbook.counterSelling : this.props.d.orderbook.baseBuying;

      if (targetBalance) {
        let inputSpendAmount = this.props.side === 'buy' ? this.state.total : this.state.amount;
        let maxOffer = targetBalance;
        if (targetAsset.isNative()) {
          maxOffer = this.props.d.session.account.maxLumenSpend();
          youHave = <div className="OfferMaker__youHave">You may create an offer of up to {maxOffer} XLM. <br />For more info, see <a href="#account">the minimum balance section</a>.</div>;
        } else {
          youHave = <div className="OfferMaker__youHave">You have {targetBalance} {targetAsset.getCode()}</div>;
        }
        if (Number(inputSpendAmount) > Number(maxOffer)) {
          insufficientBalanceMessage = <p className="OfferMaker__insufficientBalance">Error: You do not have enough {targetAsset.getCode()} to create this offer.</p>;
        }
      } else {
        youHave = <p className="OfferMaker__youHave">Must <a href="#account/addTrust">create trust line</a> for {targetAsset.getCode()} to trade</p>;
      }
    }

    let submit;
    if (this.props.d.session.state === 'in') {
      if (this.state.buttonState === 'ready') {
        if (hasAllTrust) {
          submit = <input type="submit" className="s-button" value={capitalizedSide + ' ' + baseAssetName} disabled={!this.state.valid || insufficientBalanceMessage}></input>
        } else {
          submit = <input type="submit" className="s-button" value="Trust required" disabled={true}></input>
        }
      } else {
        submit = <input type="submit" className="s-button" disabled={true} value="Creating offer..." disabled={true}></input>
      }
    } else {
      submit = <span className="OfferMaker__message"><a href="#account">Log in</a> to create an offer</span>
    }

    let summary;
    if (this.state.valid) {
      if (this.props.side === 'buy') {
        summary = <div className="s-alert s-alert--info">Buy {this.state.amount} {this.capDigits(baseAssetName)} for {this.capDigits(this.state.total)} {counterAssetName}</div>;
      } else {
        summary = <div className="s-alert s-alert--info">Sell {this.state.amount} {this.capDigits(baseAssetName)} for {this.capDigits(this.state.total)} {counterAssetName}</div>;
      }
    }

    let error;
    if (this.state.errorMessage) {
      if (this.state.errorType === 'buyNotAuthorized') {
        error = <div className="s-alert s-alert--alert OfferMaker__message">
          Unable to create offer because the issuer has not authorized you to trade this asset. To fix this issue, check with the issuer's website.<br /><br />NOTE: Some issuers are restrictive in who they authorize.
        </div>;
      } else if (this.state.errorType === 'lowReserve') {
        error = <div className="s-alert s-alert--alert OfferMaker__message">Unable to create offer because the account does not have enough lumens to meet the <a href="https://www.stellar.org/developers/guides/concepts/fees.html#minimum-account-balance" target="_blank" rel="nofollow noopener noreferrer">minimum balance</a>. For more info, see <a href="#account">the minimum balance section</a> of the account page.<br /><br />Possible solutions:
          <ul className="OfferMaker__errorList">
            <li>Send 11 lumens to your account</li>
            <li>Decrease your minimum balance by deleting an offer</li>
            <li>Decrease your minimum balance by <a href="#account/addTrust">unaccepting an asset</a></li>
          </ul>
        </div>;
      } else {
        error = <div className="s-alert s-alert--alert OfferMaker__message">Failed to create offer. Possible reasons why:
          <ul className="OfferMaker__errorList">
            <li>Not enough funds to complete order.</li>
            <li>Error code: {this.state.errorType}</li>
          </ul>
        </div>;
      }
    }

    let success;
    if (this.state.successMessage !== '') {
      success = <div className="s-alert s-alert--success OfferMaker__message">{this.state.successMessage}</div>;
    }

    return <div>
      <h3 className="island__sub__division__title island__sub__division__title--left">{title}</h3>
      <form onSubmit={this.handleSubmit}  disabled={!this.state.valid || this.state.buttonState === 'pending'}>
        <table className="OfferMaker__table">
          <tbody>
            <tr className="OfferMaker__table__row">
              <td className="OfferMaker__table__label">Price per {baseAssetName}</td>
              <td className="OfferMaker__table__input">
                <input type="text" className="OfferMaker__table__input__input" value={this.state.price} onChange={(e) => this.updateState('price', e.target.value)} placeholder="" />
              </td>
            </tr>
            <tr className="OfferMaker__table__row">
              <td className="OfferMaker__table__label">Amount {baseAssetName}</td>
              <td className="OfferMaker__table__input">
                <input type="text" className="OfferMaker__table__input__input" value={this.state.amount} onChange={(e) => this.updateState('amount', e.target.value)} placeholder="" />
              </td>
            </tr>
            <tr className="OfferMaker__table__row">
              <td className="OfferMaker__table__label">Total {counterAssetName}</td>
              <td className="OfferMaker__table__input">
                <input type="text" className="OfferMaker__table__input__input" value={this.state.total} onChange={(e) => this.updateState('total', e.target.value)} placeholder="" />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="OfferMaker__overview">
          {youHave}
          {insufficientBalanceMessage}
          {summary}
          {error}
          {success}
          {submit}
        </div>
      </form>
    </div>
  }
};

OfferMaker.propTypes = {
  side: PropTypes.oneOf(['buy', 'sell']).isRequired,
}
