import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import Driver from '../../../../../lib/Driver';
import OfferMakerResultMessage from './OfferMakerResultMessage/OfferMakerResultMessage';


export default class OfferMakerOverview extends React.Component {
    static capDigits(input) {
        try {
            return new BigNumber(input).toFixed(7).toString();
        } catch (e) {
            return (Math.floor((input * 10000000)) / 10000000).toFixed(7);
        }
    }

    getButtonContent(capitalizedSide, baseBuying, counterSelling) {
        const { valid, amount, total, buttonState } = this.props.offerState;

        if (buttonState === 'pending') {
            return <div className="nk-spinner" />;
        }

        if (!valid) {
            return `${capitalizedSide} ${baseBuying.getCode()} `;
        }

        return (
            `${capitalizedSide} ${this.constructor.capDigits(amount)} ${baseBuying.getCode()} 
             for ${this.constructor.capDigits(total)} ${counterSelling.getCode()}`
        );
    }

    getSubmitButton(capitalizedSide, baseBuying, counterSelling) {
        if (this.props.hasTrustNeeded) {
            return null;
        }
        const { offerState } = this.props;
        const { valid, buttonState } = offerState;
        const isButtonReady = buttonState === 'ready';

        return (
            <button
                type="submit"
                className={`offer_button ${capitalizedSide}`}
                disabled={!valid || !isButtonReady}>
                {this.getButtonContent(capitalizedSide, baseBuying, counterSelling)}
            </button>
        );
    }

    render() {
        const { state } = this.props.d.session;
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const isBuy = this.props.side === 'buy';
        const capitalizedSide = isBuy ? 'Buy' : 'Sell';

        if (state === 'out') {
            return (
                <div className="OfferMakerOverview_login">
                    <span className="offer_message">
                        <a onClick={() => this.props.d.modal.handlers.activate('LoginModal')}>Log in</a>
                        {' '}or <Link to="/signup/">Sign up</Link> to create an offer
                    </span>
                </div>
            );
        }

        if (state === 'unfunded') {
            return (
                <div className="OfferMakerOverview_login">
                    <span className="offer_message">
                        <Link to="/account/">Activate your Stellar account to trade</Link>
                    </span>
                </div>
            );
        }

        return (
            <div className="offer_overview">
                <OfferMakerResultMessage offerState={this.props.offerState} />
                {this.getSubmitButton(capitalizedSide, baseBuying, counterSelling)}
            </div>
        );
    }
}
OfferMakerOverview.propTypes = {
    side: PropTypes.oneOf(['buy', 'sell']).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    hasTrustNeeded: PropTypes.bool,
    offerState: PropTypes.shape({
        valid: PropTypes.bool,
        amount: PropTypes.string,
        total: PropTypes.string,
        buttonState: PropTypes.oneOf(['ready', 'pending']),
    }).isRequired,
};
