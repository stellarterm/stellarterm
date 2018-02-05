const React = window.React = require('react');
import OfferMaker from './OfferMaker.jsx';

export default class OfferMakers extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillUnmount() {
  }
  render() {
    if (!this.props.d.orderbook.data.ready) {
      console.log(this.props.d.orderbook.data.ready)
      return <div>Loading</div>;
    }

    return <div className="OfferMakers island__sub">
      <div className="OfferMakers_maker island__sub__division">
        <OfferMaker d={this.props.d} side="buy"></OfferMaker>
      </div>
      <div className="OfferMakers_maker island__sub__division">
        <OfferMaker d={this.props.d} side="sell"></OfferMaker>
      </div>
    </div>
  }
};
