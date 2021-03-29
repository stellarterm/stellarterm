/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { getEndpoint } from '../../lib/api/endpoints';
import * as request from '../../lib/api/request';
import images from '../../images';
import Driver from '../../lib/Driver';
import BuyCryptoStatic from './BuyCryptoStatic/BuyCryptoStatic';
import CurrencyDropdown from './CurrencyDropdown/CurrencyDropdown';

const getMoonpayInputError = (amount, { name, min_amount, max_amount }) => {
    let inputError = '';
    if (!amount) {
        return false;
    }

    try {
        switch (true) {
            case amount < min_amount:
                inputError = `You can't spend less than ${min_amount} ${name}`;
                break;
            case amount > max_amount:
                inputError = `You can't spend more than ${max_amount} ${name}`;
                break;
            default:
        }
    } catch (e) {
        return false;
    }

    return inputError;
};

export default class BuyCrypto extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPending: true,
            isEnabled: false,
            selectedCurrency: null,
            selectedCrypto: { code: 'XLM', icon: '' },
            currencies: [],
            crypto: [],
            cryptoPrices: {},
            currencyAmount: '',
            cryptoAmount: '',
            quote: null,
            error: null,
        };
    }

    async componentDidMount() {
        await this.initMoonpay();
    }

    // componentDidUpdate() {
    //     const { selectedCrypto } = this.state;

    //     try {
    //         const urlCryptoCode = new URLSearchParams(window.location.search).get('code');

    //         const isCurrencyUpdateNeeded = selectedCrypto && urlCryptoCode && urlCryptoCode !== selectedCrypto.code;

    //         if (isCurrencyUpdateNeeded) {
    //             this.setState({
    //                 selectedCrypto: this.state.crypto.find(crypto => crypto.code === urlCryptoCode.toUpperCase()),
    //             });
    //         }
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }

    getMoonpayStatus() {
        return request
            .get(getEndpoint('moonpayStatus'))
            .then(({ MOONPAY_ENABLED }) => {
                this.setState({ isEnabled: MOONPAY_ENABLED });
            })
            .catch(e => {
                this.setState({ error: e });
            });
    }

    getMoonpayCurrencies() {
        return request
            .get(getEndpoint('moonpayCurrencies'))
            .then(({ results }) => {
                this.setState({ currencies: results });
                return results;
            })
            .catch(e => {
                this.setState({ error: e });
            });
    }

    getMoonpayCrypto() {
        const params = { page_size: 'all' };
        return request
            .get(getEndpoint('moonpayCrypto', params))
            .then(({ results }) => {
                this.setState({ crypto: results });
                return results;
            })
            .catch(e => {
                this.setState({ error: e });
            });
    }

    getMoonpayCryptoPrice(crypto) {
        this.setState({ selectedCrypto: crypto, isPending: true });

        const { selectedCurrency, availableCurrencies } = this.state;
        const params = { currency_code: crypto.code.toLowerCase() };

        return request
            .get(getEndpoint('moonpayCryptoPrice', params))
            .then(res => {
                this.setState({ cryptoPrices: res, isPending: false });
                const defaultCurrency = selectedCurrency || availableCurrencies.find(currency => currency.isDefault);
                this.setCurrency(defaultCurrency);
            })
            .catch(e => {
                this.setState({ error: e, isPending: false });
            });
    }

    getMoonpayQuote() {
        this.setState({ isPending: true });

        const { currencyAmount, selectedCurrency, selectedCrypto } = this.state;

        const params = {
            base_currency_code: selectedCurrency.code.toLowerCase(),
            currency_code: selectedCrypto.code.toLowerCase(),
            base_currency_amount: currencyAmount,
        };

        return request
            .get(getEndpoint('moonpayQuote', params))
            .then(quote => {
                this.getMoonpayTransaction().then(url => {
                    this.setState({ quote, isPending: false });
                    this.props.d.modal.handlers.activate('MoonpayModal', Object.assign(quote, url));
                });
            })
            .catch(e => {
                this.setState({ isPending: false, error: e });
            });
    }

    getMoonpayTransaction() {
        const { currencyAmount, cryptoAmount, selectedCurrency, selectedCrypto } = this.state;
        const {
            session: { account, unfundedAccountId },
        } = this.props.d;

        const accountID = !account ? unfundedAccountId : account.accountId();

        const params = {
            base_currency_code: selectedCurrency.code,
            base_currency_amount: currencyAmount,
            currency_code: selectedCrypto.code,
            currency_amount: cryptoAmount,
            target_address: accountID,
        };

        return request
            .get(getEndpoint('moonpayTransaction', params))
            .then(url => url)
            .catch(e => {
                this.setState({ isPending: false, error: e });
            });
    }

    setCurrency(selectedCurrency) {
        this.setState({
            selectedCurrency,
            currencyAmount: selectedCurrency.min_amount,
        });
        this.changeCurrencyAmount(selectedCurrency.min_amount);
    }

    setCrypto(selectedCrypto) {
        return this.getMoonpayCryptoPrice(selectedCrypto);
    }

    async initMoonpay() {
        try {
            let defaultCrypto;

            await this.getMoonpayStatus();
            await this.getMoonpayCurrencies().then(availableCurrencies => {
                this.setCurrency(availableCurrencies.find(currency => currency.is_default));
            });
            await this.getMoonpayCrypto().then(async availableCrypto => {
                const urlCryptoCode = new URLSearchParams(window.location.search).get('code');

                if (urlCryptoCode) {
                    defaultCrypto = availableCrypto.find(crypto => crypto.code === urlCryptoCode.toUpperCase());
                } else {
                    defaultCrypto = availableCrypto.find(crypto => crypto.is_default);
                }
            });

            await this.setCrypto(defaultCrypto);
        } catch (e) {
            this.setState({ isPending: false });
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        this.getMoonpayQuote();
    }

    changeCurrencyAmount(amount) {
        const { cryptoPrices, selectedCurrency, selectedCrypto } = this.state;

        const stringAmount = amount.toString().replace(/,/g, '.');

        this.setState({
            currencyAmount: stringAmount,
            cryptoAmount: (Number(stringAmount) / cryptoPrices[selectedCurrency.code]).toFixed(
                selectedCrypto.precision,
            ),
        });
    }

    changeCryptoAmount(amount) {
        const { cryptoPrices, selectedCurrency } = this.state;

        const stringAmount = amount.toString().replace(/,/g, '.');

        this.setState({
            cryptoAmount: stringAmount,
            currencyAmount: (Number(stringAmount) * cryptoPrices[selectedCurrency.code]).toFixed(
                selectedCurrency.precision,
            ),
        });
    }

    renderMoonpayForm() {
        const {
            error,
            isPending,
            currencies,
            crypto,
            selectedCrypto,
            selectedCurrency,
            currencyAmount,
            cryptoAmount,
        } = this.state;

        if (error) {
            return <div>error</div>;
        }

        const limitsLabel =
            selectedCurrency &&
            `* Min - ${selectedCurrency.symbol}${selectedCurrency.min_amount}.
        Max - ${selectedCurrency.symbol}${selectedCurrency.max_amount}`;

        const errorText = getMoonpayInputError(currencyAmount, selectedCurrency);

        const labelText = errorText || limitsLabel;

        return (
            <form onSubmit={e => this.handleSubmit(e)}>
                <label htmlFor="currencyInput">
                    <span>You pay</span>
                    <span className={errorText ? 'label_error' : 'label_info'}>{labelText}</span>
                </label>
                <div className="Input_block_wrapper">
                    <input
                        name="currencyInput"
                        type="text"
                        autoComplete="off"
                        className="Moonpay_input"
                        value={currencyAmount}
                        maxLength={20}
                        onChange={e => this.changeCurrencyAmount(e.target.value)}
                        placeholder={`Amount in ${selectedCurrency.code} you pay`}
                    />

                    <CurrencyDropdown
                        currencies={currencies}
                        selectedToken={selectedCurrency}
                        changeFunc={token => this.setCurrency(token)}
                    />
                </div>
                <label htmlFor="currencyInput" className="label_withMargin">
                    You get
                </label>
                <div className="Input_block_wrapper">
                    <input
                        name="cryptoInput"
                        type="text"
                        autoComplete="off"
                        className="Moonpay_input"
                        value={cryptoAmount}
                        maxLength={56}
                        onChange={e => this.changeCryptoAmount(e.target.value)}
                        placeholder={`Amount in ${selectedCrypto.code} you get`}
                    />

                    <CurrencyDropdown
                        currencies={crypto}
                        selectedToken={selectedCrypto}
                        changeFunc={token => this.setCrypto(token)}
                    />
                </div>
                <div className="form_footer">
                    <div className="visa_mc_wrapper">
                        <span>Accepted here</span>
                        <img src={images['icon-visa-mc']} alt="credit-card" className="cards_logo" />
                    </div>

                    <button type="submit" className="s-button" disabled={isPending}>
                        Buy {selectedCrypto && selectedCrypto.code.toUpperCase()}
                    </button>
                </div>{' '}
            </form>
        );
    }

    render() {
        const { isPending } = this.state;

        return (
            <div className="BuyCrypto_wrapper">
                <div className="BuyCrypto_main">
                    <div className="BuyCrypto_main-text-block">
                        <div className="BuyCrypto_title">
                            Buy crypto assets <br /> with VISA or Mastercard
                        </div>
                        <div className="BuyCrypto_description">
                            With StellarTerm, you can easily buy Lumens, Bitcoin, Ethereum, Ripple and other
                            cryptocurrencies using US Dollars or Euro
                        </div>
                    </div>

                    <div className="BuyCrypto_form">
                        {isPending ? (
                            <div className="Loader_wrapper">
                                <div className="nk-spinner" />
                            </div>
                        ) : (
                            <React.Fragment>{this.renderMoonpayForm()}</React.Fragment>
                        )}
                    </div>
                </div>

                <BuyCryptoStatic />
            </div>
        );
    }
}

BuyCrypto.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
