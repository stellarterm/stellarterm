import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import Driver from '../../../../lib/Driver';
import OfferError from './OfferError';
import TrustButton from '../../../Session/TrustButton';


export default class OfferMakerOverview extends React.Component {
    static capDigits(input) {
        try {
            return new BigNumber(input).toFixed(7).toString();
        } catch (e) {
            return input;
        }
    }

    render() {
        const login = this.props.d.session.state === 'in';

        if (!login) {
            return null;
        }

        const baseAssetName = this.props.d.orderbook.data.baseBuying.getCode();
        const counterAssetName = this.props.d.orderbook.data.counterSelling.getCode();

        let youHave;
        let insufficientBalanceMessage;

        if (this.props.assetName === 'XLM') {
            youHave = (
                <div className="OfferMaker__youHave">
                    You may trade up to {this.props.balance} XLM (due to <a href="#account">
                    minimum balance requirements</a>).
                </div>
            );
        } else {
            youHave = <div className="OfferMaker__youHave">You have {this.props.balance} {this.props.assetName}</div>;
        }

        if (this.props.insufficient) {
            insufficientBalanceMessage = (
                    <p className="OfferMaker__insufficientBalance">
                       Error: You do not have enough {this.props.assetName} to create this offer.
                    </p>
                );
        }


        const capitalizedSide = this.props.side === 'buy' ? 'Buy' : 'Sell';

        let summary;
        if (this.props.valid) {
            summary = (
                <div className="s-alert s-alert--info">
                    {capitalizedSide} {this.props.amount} {this.constructor.capDigits(baseAssetName)} for{' '}
                    {this.constructor.capDigits(this.props.total)} {counterAssetName}
                </div>
            );
        }

        let error;
        if (this.props.errorMessage) {
            error = OfferError(this.props.errorType);
        }

        let success;
        if (this.props.successMessage) {
            success = (
                <div className="s-alert s-alert--success OfferMaker__message">
                    {this.props.successMessage}
                </div>
            );
        }

        if (this.props.trustNeeded.length) {
            return (
                <div>
                    <p className="OfferMaker__enable">To trade, activate these assets on your account:</p>
                    <div className="row__multipleButtons">
                        {this.props.trustNeeded.map(asset => (
                            <TrustButton
                                key={`${asset.getCode()}-${asset.getIssuer()}`}
                                d={this.props.d}
                                asset={asset}
                                message={`${asset.getCode()} accepted`}
                                trustMessage={`Accept ${asset.getCode()}`} />
                        ))}
                    </div>
                </div>
            );
        }
        return (
            <div className="OfferMaker__overview">
                {youHave}
                {insufficientBalanceMessage}
                {summary}
                {error}
                {success}
            </div>
        );
    }
}
OfferMakerOverview.propTypes = {
    side: PropTypes.oneOf(['buy', 'sell']).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    trustNeeded: PropTypes.arrayOf(PropTypes.object),
    insufficient: PropTypes.bool,
    balance: PropTypes.string,
    assetName: PropTypes.string,
    valid: PropTypes.bool,
    total: PropTypes.string,
    amount: PropTypes.string,
    errorType: PropTypes.string,
    errorMessage: PropTypes.bool,
    successMessage: PropTypes.string,
};
