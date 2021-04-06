/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

export default class MoonpayModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dontShow: localStorage.getItem('hide-browser-popup') === 'true',
        };
    }

    onClickConfirm() {
        const {
            submit,
            quote: { url },
        } = this.props;
        window.open(url, '_blank', 'noopener,noreferrer');
        submit.cancel();
    }

    render() {
        const {
            quote: {
                baseCurrency,
                currency,
                quoteCurrencyAmount,
                feeAmount,
                networkFeeAmount,
                extraFeeAmount,
                totalAmount,
            },
        } = this.props;

        const totalFee = (feeAmount + networkFeeAmount + extraFeeAmount).toFixed(baseCurrency.precision);
        const orderCurrency = baseCurrency.code.toUpperCase();

        return (
            <div className="MoonpayModal">
                <div className="Modal_header">
                    <span>Confirm your order</span>
                    <img src={images['icon-close']} alt="X" onClick={this.props.submit.cancel} />
                </div>

                <div className="MoonpayModal_content">
                    <p className="moonpay_title">
                        Please review the details of your order before continuing with the payment process.
                    </p>

                    <div className="order_details">
                        <div className="details_row">
                            <span className="details_desc">Order amount:</span>
                            <span className="details_data">
                                {quoteCurrencyAmount} {currency.code.toUpperCase()}
                            </span>
                        </div>
                        <div className="details_row">
                            <span className="details_desc">Service fee:</span>
                            <span className="details_data">
                                {totalFee} {orderCurrency}
                            </span>
                        </div>
                        <div className="details_row">
                            <span className="details_desc">Total charge (fee included):</span>
                            <span className="details_data">
                                {totalAmount} {orderCurrency}
                            </span>
                        </div>
                    </div>

                    <p className="moonpay_description">
                        You will be redirected to moonpay.io. Services relating to credit card payments are provided by
                        Moonpay, which is a separate platform owned by a third party. StellarTerm does not assume any
                        responsibility for any loss or damage caused by the use of the credit card payment service.
                    </p>

                    <button
                        className="s-button"
                        onClick={() => {
                            this.onClickConfirm();
                        }}
                    >
                        Confirm order
                    </button>
                </div>
            </div>
        );
    }
}

MoonpayModal.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    quote: PropTypes.objectOf(PropTypes.any),
};
