/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../../../../lib/driver/Driver';
import images from '../../../../../../images';
import AssetCardInRow from '../../../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import { formatDate } from './../../Activity';
import Printify from '../../../../../../lib/helpers/Printify';
import { TX_STATUS } from '../../../../../../lib/constants/sessionConstants';
import ErrorHandler from '../../../../../../lib/helpers/ErrorHandler';


export default class ActivityOpenOrdersRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonReady: true,
        };
    }

    async removeOffer(event, offer) {
        event.preventDefault();

        const { handlers } = this.props.d.session;
        const signAndSubmit = await handlers.removeOffer(offer);

        if (signAndSubmit.status !== TX_STATUS.FINISH) { return; }

        this.setState({ buttonReady: false });

        try {
            await signAndSubmit.serverResult;
            this.setState({ buttonReady: 'true' });
        } catch (error) {
            const errorMessage = ErrorHandler(error);
            this.props.d.toastService.error('Can’t cancel the offer', errorMessage);
            console.error('Errored when cancelling offer', error);
            this.setState({ buttonReady: 'true' });
        }
    }

    handleEdit(event, offerData) {
        event.preventDefault();
        const { base, counter } = offerData.rectifiedOffer;
        this.props.d.orderbook.setOrderbook(counter, base);
        this.props.d.modal.handlers.activate('EditOfferModal', offerData);
    }


    render() {
        const { offer, d, style } = this.props;
        const { buttonReady } = this.state;
        const { last_modified_time, buying, selling, amount, price, price_r, id } = offer;
        const { time, date } = formatDate(last_modified_time);
        const base = buying.asset_issuer ?
            new StellarSdk.Asset(buying.asset_code, buying.asset_issuer) : new StellarSdk.Asset.native();

        const counter = selling.asset_issuer ?
            new StellarSdk.Asset(selling.asset_code, selling.asset_issuer) : new StellarSdk.Asset.native();

        const priceRevert = new BigNumber(price_r.d).dividedBy(price_r.n).toFixed(7);
        const total = new BigNumber(price_r.n).dividedBy(price_r.d).times(amount).toFixed(7);

        const offerData = {
            rectifiedOffer: {
                id,
                price,
                priceRevert,
                base,
                counter,
                baseAmount: amount,
                counterAmount: total,
            },
            withSwitch: true,
            side: 'sell',
        };

        return (
            <div className="Activity-table-row" style={style}>
                <div className="Activity-table-cell flex3">
                    {`${date} ${time}`}
                </div>
                <div className="Activity-table-cell flex3">
                    <AssetCardInRow d={d} code={counter.code} issuer={counter.issuer} />
                </div>
                <div className="Activity-table-cell flex3">
                    <AssetCardInRow d={d} code={base.code} issuer={base.issuer} />
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex3">
                    {Printify.lightenZeros(offerData.rectifiedOffer.baseAmount,
                        undefined, ` ${counter.code || 'XLM'}`)}
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex3">
                    {Printify.lightenZeros(offerData.rectifiedOffer.price)}
                </div>
                <div className="Activity-table_item_right Activity-table-cell flex3">
                    {Printify.lightenZeros(offerData.rectifiedOffer.counterAmount,
                        undefined, ` ${base.code || 'XLM'}`)}
                </div>
                <div className="Activity-table_actions Activity-table-cell flex1_5">
                    <img
                        onClick={e => this.handleEdit(e, offerData)}
                        src={images['icon-edit']}
                        alt="edit"
                        title="Edit order"
                    />
                    {buttonReady ? <img
                        onClick={e => this.removeOffer(e, offer)}
                        src={images['icon-close-green']}
                        alt="cancel"
                        title="Cancel order"
                    /> :
                        <div className="nk-spinner-green">
                            <div className="nk-spinner" />
                        </div>}
                </div>
            </div>
        );
    }
}
ActivityOpenOrdersRow.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    offer: PropTypes.objectOf(PropTypes.any),
    style: PropTypes.objectOf(PropTypes.any),
};
