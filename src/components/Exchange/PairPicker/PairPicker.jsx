import React from 'react';
import PropTypes from 'prop-types';

import Format from '../../../lib/Format';
import Driver from '../../../lib/Driver';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';
import AssetPair from '../../Common/AssetPair/AssetPair';

export default class PairPicker extends React.Component {
    componentWillUnmount() {
        this.props.d.ticker.event.sub(() => {
            this.forceUpdate();
        });
    }

    getPriceBlock() {
        const { data } = this.props.d.orderbook;
        const { baseBuying, counterSelling } = data;
        const { d } = this.props;

        const dataIsReady = data.ready && d.ticker.ready;
        if (!dataIsReady) {
            return (<p className="Ticker_data">Loading<Ellipsis /></p>);
        }

        const noPriceData = data.asks.length === 0 || data.bids.length === 0;
        if (noPriceData) { return (<p className="Ticker_data">No data</p>); }

        const latestPrice = (Number(data.asks[0].price) + Number(data.bids[0].price)) / 2;
        const isBaseNative = baseBuying.isNative();
        if (isBaseNative) {
            return (
                <p className="Ticker_data">
                    {Format.niceRound(latestPrice)} XLM/{counterSelling.getCode()}
                </p>
            );
        }

        let latestXLM = Format.niceRound(latestPrice);
        if ((1 - data.bids[0].price) / data.asks[0].price > 0.4) {
            latestXLM = Format.niceRound(data.bids[0].price);
        }

        const latestUSD = Format.niceRound(latestXLM * d.ticker.data._meta.externalPrices.USD_XLM);
        return (
            <p className="Ticker_data">
                <span className="Ticker_course">{latestXLM} XLM</span>
                <span className="Ticker_course">${latestUSD}</span>
            </p>
        );
    }

    getPairPickerBlock() {
        const { data } = this.props.d.orderbook;
        const { baseBuying, counterSelling } = data;
        const { d } = this.props;

        const isBaseNative = baseBuying.isNative();
        const isCounterNative = counterSelling.isNative();

        if (isBaseNative || isCounterNative) {
            const priceBlock = this.getPriceBlock();
            return (
                <div className="PairPicker_infoBar">
                    <div className="InfoBar_pair">
                        <AssetPair baseBuying={baseBuying} counterSelling={counterSelling} d={d} swap dropdown />
                    </div>

                    <div className="Infobar_ticker">
                        <p className="Ticker_title">Current price for {baseBuying.getCode()}</p>
                        {priceBlock}
                    </div>
                </div>
            );
        }

        return (
            <div className="PairPicker_assetPair">
                <AssetPair baseBuying={baseBuying} counterSelling={counterSelling} d={d} swap dropdown />
            </div>
        );
    }

    render() {
        const { ready } = this.props.d.orderbook.data;

        if (!ready) {
            return (<div>Loading<Ellipsis /></div>);
        }

        const pairPickerBlock = this.getPairPickerBlock();

        return (
            <div className="island">
                {pairPickerBlock}

                <a href="#markets" className="PairPicker_seeOthers">
                    <span>See other trading pairs</span>
                </a>
            </div>
        );
    }
}

PairPicker.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
