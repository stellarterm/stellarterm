const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');

const Offers = require('./components/Offers.jsx');



let offersProps = {
  buying: new StellarSdk.Asset('XLM', null),
  selling: new StellarSdk.Asset('USD', 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE'),
  bids: [
    {
      'price_r': {
        'n': 1,
        'd': 500
      },
      'price': '0.0020000',
      'amount': '10.0000000'
    }
  ],
  asks: [
    {
      'price_r': {
        'n': 1,
        'd': 400
      },
      'price': '0.0025000',
      'amount': '750.0000000'
    }
  ],
}


const TodoApp = React.createClass({
  render() {
    return (
      <div>Hello
        <Offers {...offersProps}></Offers>
      </div>
    );
  },
});

ReactDOM.render(<TodoApp />, mountNode);

