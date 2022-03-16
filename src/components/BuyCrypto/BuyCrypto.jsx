/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { getEndpoint } from '../../lib/api/endpoints';
import * as request from '../../lib/api/request';
import images from '../../images';
import Driver from '../../lib/driver/Driver';
import { isValidToPrecision, isNoRecalculateNeeded } from '../../lib/helpers/Format';
import BuyCryptoStatic from './BuyCryptoStatic/BuyCryptoStatic';
import CurrencyDropdown from './CurrencyDropdown/CurrencyDropdown';

const INITIAL_STATE = {
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

export default class BuyCrypto extends React.Component {
    /**
     * Return object with popular/nonPopular arrays of currencies
     * @param {Array} currencies currencies/crypto from moonpay
     * @returns {Object} {popular/nonPopular} currencies/crypto arrays
     */
    static getSortedCurrencies(currencies) {
        const nonPopularCurrencies = [];
        const popularCurrencies = currencies
            .map(currency => {
                if (currency.is_popular) {
                    return currency;
                }
                nonPopularCurrencies.push(currency);
                return null;
            })
            .filter(el => el !== null);

        return { popular: popularCurrencies, nonPopular: nonPopularCurrencies };
    }

    static getMoonpayInputError(amount, { name, min_amount, max_amount }) {
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
    }

    constructor(props) {
        super(props);

        this.state = INITIAL_STATE;
    }

    async componentDidMount() {
        await this.initMoonpay();
    }

    componentDidUpdate(prevProps) {
        const { selectedCrypto, isPending } = this.state;

        if (prevProps.location.search !== window.location.search) {
            try {
                const urlCryptoCode = new URLSearchParams(window.location.search).get('code');

                const isCurrencyUpdateNeeded =
                    !isPending && selectedCrypto && urlCryptoCode && urlCryptoCode !== selectedCrypto.code;

                if (isCurrencyUpdateNeeded) {
                    this.setCrypto(this.state.crypto.find(crypto => crypto.code === urlCryptoCode.toUpperCase()));
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(e);
            }
        }
    }

    getMoonpayStatus() {
        return request.get(getEndpoint('moonpayStatus')).catch(e => this.setState({ error: e }));
    }

    getMoonpayCurrencies() {
        return request
            .get(getEndpoint('moonpayCurrencies'))
            .then(({ results }) => results)
            .catch(e => this.setState({ error: e }));
    }

    getMoonpayCrypto() {
        const params = { page_size: 'all' };
        return request
            .get(getEndpoint('moonpayCrypto', params))
            .then(({ results }) => results)
            .catch(e => this.setState({ error: e }));
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
            .catch(e => this.setState({ isPending: false, error: e }));
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
            target_address: selectedCrypto.code === 'XLM' ? accountID : 'null',
        };

        return request
            .get(getEndpoint('moonpayTransaction', params))
            .then(url => url)
            .catch(e => this.setState({ isPending: false, error: e }));
    }

    setCrypto(selectedCrypto) {
        this.setState({ selectedCrypto, isPending: true });

        const { selectedCurrency, availableCurrencies } = this.state;
        const params = { currency_code: selectedCrypto.code.toLowerCase() };

        return request
            .get(getEndpoint('moonpayCryptoPrice', params))
            .then(res => {
                this.setState({ cryptoPrices: res, isPending: false });
                const defaultCurrency = selectedCurrency || availableCurrencies.find(currency => currency.isDefault);
                this.changeCurrencyAmount(defaultCurrency.min_amount, defaultCurrency);
            })
            .catch(e => this.setState({ error: e, isPending: false }));
    }

    async initMoonpay() {
        this.setState({ isPending: true, error: null });
        try {
            let defaultCrypto;

            const { MOONPAY_ENABLED } = await this.getMoonpayStatus();
            this.setState({ isEnabled: MOONPAY_ENABLED });

            const availableCurrencies = await this.getMoonpayCurrencies();
            const defaultCurrency = availableCurrencies.find(currency => currency.is_default);
            this.changeCurrencyAmount(defaultCurrency.min_amount, defaultCurrency);

            const availableCrypto = await this.getMoonpayCrypto();
            const urlCryptoCode = new URLSearchParams(window.location.search).get('code');

            if (urlCryptoCode) {
                defaultCrypto = availableCrypto.find(crypto => crypto.code === urlCryptoCode.toUpperCase());
            } else {
                defaultCrypto = availableCrypto.find(crypto => crypto.is_default);
            }

            this.setState({ currencies: availableCurrencies, crypto: availableCrypto });
            await this.setCrypto(defaultCrypto);
        } catch (e) {
            this.setState({ isPending: false });
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        this.getMoonpayQuote();
    }

    changeCurrencyAmount(amount, selectedCurrency) {
        let newState;
        const { cryptoPrices, selectedCrypto } = this.state;

        const stringAmount = amount.toString().replace(/,/g, '.');
        const isValidAmount = isValidToPrecision(amount, selectedCurrency.precision);

        if (!stringAmount) {
            newState = { currencyAmount: stringAmount, cryptoAmount: stringAmount, selectedCurrency };
        }

        if (isNoRecalculateNeeded(stringAmount, selectedCurrency.precision)) {
            newState = { currencyAmount: stringAmount, selectedCurrency };
        }

        if (isValidAmount) {
            newState = {
                selectedCurrency,
                currencyAmount: stringAmount,
                cryptoAmount: (Number(stringAmount) / cryptoPrices[selectedCurrency.code]).toFixed(
                    selectedCrypto.precision,
                ),
            };
        }

        this.setState(Object.assign(this.state, newState));
    }

    changeCryptoAmount(amount) {
        let newState;
        const { cryptoPrices, selectedCurrency, selectedCrypto } = this.state;
        const stringAmount = amount.toString().replace(/,/g, '.');
        const isValidAmount = isValidToPrecision(amount, selectedCrypto.precision);

        if (!stringAmount) {
            newState = { currencyAmount: stringAmount, cryptoAmount: stringAmount };
        }

        if (isNoRecalculateNeeded(stringAmount, selectedCrypto.precision)) {
            newState = { cryptoAmount: stringAmount };
        }

        if (isValidAmount) {
            newState = {
                cryptoAmount: stringAmount,
                currencyAmount: (Number(stringAmount) * cryptoPrices[selectedCurrency.code]).toFixed(
                    selectedCurrency.precision,
                ),
            };
        }

        this.setState(Object.assign(this.state, newState));
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
            return (
                <div className="error_msg_block">
                    <img src={images['icon-circle-fail']} alt="failed" />
                    <div className="error_title">Something went wrong</div>
                    <div className="error_text">
                        An unknown error occurred due to which you cannot buy the crypto, try again in a moment
                    </div>
                    <button onClick={() => this.initMoonpay()} className="s-btn_cancel">
                        Reload
                    </button>
                </div>
            );
        }

        const limitsLabel =
            selectedCurrency &&
            `* Min - ${selectedCurrency.symbol}${selectedCurrency.min_amount}.
        Max - ${selectedCurrency.symbol}${selectedCurrency.max_amount}`;

        const errorText = this.constructor.getMoonpayInputError(currencyAmount, selectedCurrency);

        const labelText = errorText || limitsLabel;

        const isSubmitDisabled = isPending || errorText || !currencyAmount || !cryptoAmount;

        const sortedCurrencies = this.constructor.getSortedCurrencies(currencies);
        const sortedCrypto = this.constructor.getSortedCurrencies(crypto);

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
                        autoFocus
                        autoComplete="off"
                        className="Moonpay_input"
                        value={currencyAmount}
                        maxLength={20}
                        onChange={e => this.changeCurrencyAmount(e.target.value, this.state.selectedCurrency)}
                        placeholder={`Amount in ${selectedCurrency.code} you pay`}
                    />

                    <CurrencyDropdown
                        popularCurrencies={sortedCurrencies.popular}
                        nonPopularCurrencies={sortedCurrencies.nonPopular}
                        selectedToken={selectedCurrency}
                        changeFunc={token => this.changeCurrencyAmount(token.min_amount, token)}
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
                        maxLength={20}
                        onChange={e => this.changeCryptoAmount(e.target.value)}
                        placeholder={`Amount in ${selectedCrypto.code} you get`}
                    />

                    <CurrencyDropdown
                        popularCurrencies={sortedCrypto.popular}
                        nonPopularCurrencies={sortedCrypto.nonPopular}
                        selectedToken={selectedCrypto}
                        changeFunc={token => {
                            const params = new URLSearchParams(window.location.search);
                            params.set('code', token.code);
                            window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
                            this.setCrypto(token);
                        }}
                    />
                </div>
                <div className="form_footer">
                    <div className="visa_mc_wrapper">
                        <span>Accepted here</span>
                        <img src={images['icon-visa-mc']} alt="credit-card" className="cards_logo" />
                    </div>

                    <button type="submit" className="s-button" disabled={isSubmitDisabled}>
                        Buy {selectedCrypto && selectedCrypto.code.toUpperCase()}
                    </button>
                </div>
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
                            StellarTerm is a trusted place where you can easily buy Lumens and other cryptocurrencies
                            with your credit or debit card
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
