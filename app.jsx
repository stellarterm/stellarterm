const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');
const Offers = require('./components/Offers.jsx');

const Driver = require('./lib/Driver');

let driver = new Driver({
  horizonUrl: 'https://horizon.stellar.org',
});



class TermApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderbook: undefined,
    };

    this.driver = props.driver;
    this.driver.getOrderbook()
    .then(res => {
      this.setState({
        orderbook: res,
      })
    })
  }
  render() {
    return (
      <div>
        <div>
          <p>Base currency: {driver.baseBuyingAssetName()} {driver.baseBuyingGetIssuer()}</p>
          <p>Counter currency: {driver.counterSellingAssetName()} {driver.counterSellingGetIssuer()}</p>
        </div>
        <Offers orderbookDetails={this.state.orderbook}></Offers>
      </div>
    );
  }
};

ReactDOM.render(<TermApp driver={driver} />, mountNode);
