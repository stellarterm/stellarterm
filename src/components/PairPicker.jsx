const React = window.React = require('react');
import AssetCard from './AssetCard.jsx';
import AssetPair from './AssetPair.jsx';

export default class PairPicker extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillUnmount() {
  }
  render() {
    if (!this.props.d.orderbook.data.ready) {
      return <div>loading</div>
    }

    let baseBuying = this.props.d.orderbook.data.baseBuying;
    let counterSelling = this.props.d.orderbook.data.counterSelling;

    return (
      <div className="island">
        <div className="OfferTables island__sub">
          <div className="OfferTables__tables island__sub__division">
            <h3 className="island__sub__division__title">Base asset</h3>
          </div>
          <div className="OfferTables__table island__sub__division">
            <h3 className="island__sub__division__title">Counter asset</h3>
          </div>
        </div>
        <div className="PairPicker__pair">
          <AssetPair baseBuying={baseBuying} counterSelling={counterSelling}></AssetPair>
        </div>
        <div className="PairPicker__auxInfo">
          To see other orderbooks, go to the <a href="#markets">market list page</a>.
        </div>
      </div>
    );
  }
};
