import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';
import Stellarify from '../../lib/Stellarify';
import directory from 'stellarterm-directory';
import ManageOffers from './ManageOffers/ManageOffers';
import OfferTables from './OfferTables/OfferTables';
import OfferMakers from './OfferMakers/OfferMakers';
import PairPicker from './PairPicker/PairPicker';
import PriceChart from './PriceChart/PriceChart';
import Ellipsis from '../Common/Ellipsis/Ellipsis';
import Generic from '../Common/Generic/Generic';

export default class Exchange extends React.Component {
    constructor(props) {
        super(props);
        this.unsub = this.props.d.orderbook.event.sub(() => {
            this.forceUpdate();
        });
        this.unsubSession = this.props.d.session.event.sub(() => {
            this.forceUpdate();
        });
    }

    componentWillMount() {
        window.scrollTo(0, 0);
    }

    componentWillUnmount() {
        this.unsub();
        this.unsubSession();
    }

    checkOrderboorWarning() {
        const ticker = this.props.d.ticker;
        const data = this.props.d.orderbook.data;

        if (ticker.ready) {
            const baseSlug = Stellarify.assetToSlug(data.baseBuying);
            const counterSlug = Stellarify.assetToSlug(data.counterSelling);
            let aggregateDepth = 0;

            if (baseSlug !== 'XLM-native') {
                ticker.data.assets.forEach((asset) => {
                    if (asset.slug === baseSlug) {
                        aggregateDepth += asset.depth10_USD;
                    }
                });
            }

            if (counterSlug !== 'XLM-native') {
                ticker.data.assets.forEach((asset) => {
                    if (asset.slug === counterSlug) {
                        aggregateDepth += asset.depth10_USD;
                    }
                });
            }

            if (aggregateDepth < 100) {
                return (
                    <div className="Exchange__warning">
                        <div className="s-alert s-alert--warning">
                            The orderbook for this pair is thin. To get a better price, create an offer without taking
                            an existing one.
                        </div>
                    </div>
                );
            }
        }
        return null;
    }

    render() {
        if (!this.props.d.orderbook.data.ready) {
            return (
                <Generic title="Loading orderbook">
                    Loading orderbook data from Horizon
                    <Ellipsis />
                </Generic>
            );
        }

        const thinOrderbookWarning = this.checkOrderboorWarning();
        const data = this.props.d.orderbook.data;
        let warningWarning;

        const directoryAsset = directory.getAssetByAccountId(data.baseBuying.code, data.baseBuying.issuer);
        if (directoryAsset !== null && directoryAsset.warning !== undefined) {
            warningWarning = (
                <div className="Exchange__warning">
                    <div className="s-alert s-alert--warning">{directoryAsset.warning}</div>
                </div>
            );
        }

        let offermakers;
        if (directoryAsset !== null && directoryAsset.disabled !== undefined) {
            offermakers = (
                <div className="Exchange__orderbookDisabled">
                    Offer making has been disabled for this pair. You may still cancel your existing offers below.
                </div>
            );
        } else {
            offermakers = <OfferMakers d={this.props.d} />;
        }

        return (
            <div>
                <div className="so-back islandBack islandBack--t">
                    <PairPicker d={this.props.d} />
                </div>
                <PriceChart d={this.props.d} />
                <div className="so-back islandBack">
                    <div className="island Exchange__orderbook">
                        <div className="island__header">Orderbook</div>
                        {thinOrderbookWarning}
                        {warningWarning}
                        <div>
                            {offermakers}
                            <div className="island__separator" />
                            <OfferTables d={this.props.d} />
                        </div>
                    </div>
                </div>
                <div className="so-back islandBack">
                    <div className="island">
                        <div className="island__header">Manage offers</div>
                        <ManageOffers d={this.props.d} />
                    </div>
                </div>
            </div>
        );
    }
}

Exchange.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
