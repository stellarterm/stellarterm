import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../lib/Driver';
import Loading from './Loading';
import Ellipsis from './Ellipsis';
import AssetListRows from './AssetListRows';

export default class AssetList extends React.Component {
    constructor(props) {
        super(props);
        this.dTicker = props.d.ticker;
        this.listenId = this.dTicker.event.listen(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.dTicker.event.unlisten(this.listenId);
    }

    render() {
        const loadingMarket = (
            <Loading size="large">
                Loading Stellar market data
                <Ellipsis />
            </Loading>
        );

        if (!this.dTicker.ready) { return loadingMarket; }

        const assetClassName = 'AssetList__head__cell AssetList__head__asset';
        const amountClassName = 'AssetList__head__cell AssetList__head__amount';
        const { d, limit } = this.props;

        return (
            <div className="AssetList">
                <div className="AssetList__head__row">
                    <div className={assetClassName}>Asset</div>
                    <div className={amountClassName}>Price (XLM)</div>
                    <div className={amountClassName}>Price (USD)</div>
                    <div className={amountClassName}>Volume (24h)</div>
                    <div className={amountClassName}>Change (24h)</div>
                </div>
                <AssetListRows ticker={d.ticker} limit={limit} />
            </div>
        );
    }
}

AssetList.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    limit: PropTypes.number,
};
