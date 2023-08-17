import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import useDebounce from '../../lib/hooks/useDebounce';
import { ENDPOINTS, getEndpoint } from '../../lib/api/endpoints';
import { getWithCancel, get } from '../../lib/api/request';
import images from '../../images';
import Driver from '../../lib/driver/Driver';
import { isValidToPrecision, isNoRecalculateNeeded } from '../../lib/helpers/Format';
import BuyCryptoStatic from './BuyCryptoStatic/BuyCryptoStatic';
import CurrencyDropdown from './CurrencyDropdown/CurrencyDropdown';


/**
 * Return object with popular/nonPopular arrays of currencies
 * @param {Array} currencies currencies/crypto from moonpay
 * @returns {Object} {popular/nonPopular} currencies/crypto arrays
 */
const sortCurrencies = currencies => currencies.reduce((acc, currency) => {
    if (currency.is_popular) {
        acc.popular.push(currency);
    } else {
        acc.nonPopular.push(currency);
    }
    return acc;
}, { popular: [], nonPopular: [] });

// moonpay requests
const getMoonpayStatus = () =>
    get(getEndpoint(ENDPOINTS.MOONPAY_STATUS));

const getMoonpayCurrencies = () =>
    get(getEndpoint(ENDPOINTS.MOONPAY_CURRENCIES))
        .then(({ results }) => results);

const getMoonpayCrypto = () =>
    get(getEndpoint(ENDPOINTS.MOONPAY_CRYPTO, { page_size: 'all' }))
        .then(({ results }) => results);


const BuyCrypto = ({ d }) => {
    // ============== STATE ==============
    const [isPending, setIsPending] = useState(true);
    const [isAmountPending, setIsAmountPending] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [selectedCrypto, setSelectedCrypto] = useState(null);
    const [currencies, setCurrencies] = useState([]);
    const [crypto, setCrypto] = useState([]);
    const [currencyAmount, setCurrencyAmount] = useState('');
    const [cryptoAmount, setCryptoAmount] = useState('');
    const [quote, setQuote] = useState(null);
    const [initError, setInitError] = useState(null);
    const [quoteError, setQuoteError] = useState(null);

    // ============== ROUTER HOOKS ==============
    const location = useLocation();
    const history = useHistory();

    // debounced values for use state with inputs
    const debouncedCurrencyAmount = useDebounce(currencyAmount, 500);
    const debouncedCryptoAmount = useDebounce(cryptoAmount, 500);

    // create request with handle canceller
    const canceller = useRef(null);

    const createRequestWithCancel = url => {
        const { request, cancel } = getWithCancel(url);

        canceller.current = cancel;

        return request;
    };

    // get status, currencies and crypto from moonpay
    const initMoonpay = () => {
        setIsPending(true);
        setInitError(null);

        Promise.all([getMoonpayStatus(), getMoonpayCurrencies(), getMoonpayCrypto()])
            .then(([{ MOONPAY_ENABLED }, availableCurrencies, availableCrypto]) => {
                setIsEnabled(MOONPAY_ENABLED);

                const defaultCurrency = availableCurrencies.find(currency => currency.is_default);

                setCurrencies(availableCurrencies);
                setCrypto(availableCrypto);
                setSelectedCurrency(defaultCurrency);
                setCurrencyAmount(String(defaultCurrency.min_amount));

                setIsPending(false);
            }).catch(e => {
                setInitError(e);
                setIsPending(false);
            });
    };

    // getting up-to-date information about the purchase of cryptocurrencies,
    // depending on the selected currencies and the transaction amount
    const getQuote = () => {
        if (
            (!currencyAmount && !cryptoAmount) ||
            (currencyAmount && cryptoAmount) ||
            !selectedCurrency ||
            !selectedCrypto
        ) {
            return;
        }

        if (canceller.current) {
            canceller.current();
        }
        setIsAmountPending(true);
        setQuoteError(null);
        setQuote(null);

        const params = {
            base_currency_code: selectedCurrency.code.toLowerCase(),
            currency_code: selectedCrypto.code.toLowerCase(),
        };

        if (currencyAmount) {
            params.base_currency_amount = currencyAmount;
        }

        if (cryptoAmount) {
            params.quote_currency_amount = cryptoAmount;
        }

        createRequestWithCancel(getEndpoint(ENDPOINTS.MOONPAY_QUOTE, params))
            .then(res => {
                setQuote(res);
                setIsAmountPending(false);
                setQuoteError(null);
                if (Boolean(currencyAmount) && Number(currencyAmount) === res.baseCurrencyAmount) {
                    return setCryptoAmount(String(res.quoteCurrencyAmount));
                }

                if (Boolean(cryptoAmount) && Number(cryptoAmount) === res.quoteCurrencyAmount) {
                    return setCurrencyAmount(String(res.baseCurrencyAmount));
                }

                if (Boolean(currencyAmount) && Number(currencyAmount) >= Number(selectedCurrency.min_amount)) {
                    return setCryptoAmount(
                        (Number(currencyAmount) / res.quoteCurrencyPrice).toFixed(selectedCrypto.precision),
                    );
                }
                return null;
            }).catch(e => {
                setIsAmountPending(false);
                if (e.name === 'AbortError') {
                    return;
                }

                setQuoteError((e.data && e.data.detail) || 'Something went wrong');
            });
    };

    // ================= memoized values =================

    const limitsLabel = useMemo(() => {
        if (!selectedCurrency) {
            return '';
        }
        const { symbol, min_amount: minAmount, max_amount: maxAmount } = selectedCurrency;

        return `* Min - ${symbol}${minAmount}. Max - ${symbol}${maxAmount}`;
    }, [selectedCurrency]);

    const errorText = useMemo(() => {
        if (!selectedCurrency) {
            return '';
        }

        if (quoteError) {
            return quoteError;
        }

        if (!currencyAmount) {
            return '';
        }

        const { name, min_amount: minAmount, max_amount: maxAmount } = selectedCurrency;

        if (Number(currencyAmount) >= Number(minAmount) && Number(currencyAmount) <= Number(maxAmount)) {
            return '';
        }

        return Number(currencyAmount) > Number(maxAmount) ?
            `You can't spend more than ${maxAmount} ${name}` :
            `You can't spend less than ${minAmount} ${name}`;
    }, [currencyAmount, selectedCurrency, quoteError]);

    const isSubmitDisabled = useMemo(() =>
        isPending ||
            errorText ||
            !currencyAmount ||
            !cryptoAmount ||
            isAmountPending,
    [isPending, errorText, currencyAmount, cryptoAmount, isAmountPending],
    );

    const sortedCurrencies = useMemo(() => sortCurrencies(currencies), [currencies]);
    const sortedCrypto = useMemo(() => sortCurrencies(crypto), [crypto]);

    // ================= effects =================

    useEffect(() => {
        initMoonpay();
    }, []);

    // listen the location to change the selectedCrypto
    useEffect(() => {
        if (!crypto.length) {
            return;
        }
        const urlParams = new URLSearchParams(location.search);
        const urlCryptoCode = urlParams.get('code');

        const defaultCrypto = crypto.find(({ is_default: isDefault }) => isDefault);
        const currentCrypto = crypto.find(({ code }) => Boolean(urlCryptoCode) && code === urlCryptoCode.toUpperCase());

        if (!urlCryptoCode || !currentCrypto) {
            urlParams.set('code', defaultCrypto.code);
            history.replace({ search: urlParams.toString() });
            return;
        }

        setSelectedCrypto(currentCrypto);
        setCryptoAmount('');
    }, [crypto, location]);

    // update the quote when the currencies change
    useEffect(() => {
        getQuote();
    }, [selectedCurrency, selectedCrypto]);


    // update the quote when the amount change
    useEffect(() => {
        if (isNoRecalculateNeeded(debouncedCurrencyAmount) || !debouncedCurrencyAmount) {
            return;
        }
        getQuote();
    }, [debouncedCurrencyAmount]);

    // update the quote when the amount change
    useEffect(() => {
        if (isNoRecalculateNeeded(debouncedCryptoAmount) || !debouncedCryptoAmount) {
            return;
        }

        getQuote();
    }, [debouncedCryptoAmount]);


    // currency dropdown handler
    const onCurrencyChange = token => {
        setCurrencyAmount(String(token.min_amount));
        setSelectedCurrency(token);
        setCryptoAmount('');
    };

    // crypto dropdown handler
    const onCryptoChange = token => {
        const params = new URLSearchParams(location.search);
        params.set('code', token.code);
        history.replace({ search: params.toString() });
    };

    // currency and crypto inputs handler
    const onAmountChange = ({ target }, isCurrency) => {
        const amount = target.value;
        const stringAmount = amount.toString().replace(/,/g, '.');
        const isValidAmount = isValidToPrecision(
            stringAmount,
            isCurrency ? selectedCurrency.precision : selectedCrypto.precision,
        );

        if (Number.isNaN(Number(stringAmount)) || !isValidAmount) {
            return;
        }

        if (canceller.current) {
            canceller.current();
        }

        if (isCurrency) {
            setCurrencyAmount(stringAmount);
        } else {
            setCryptoAmount(stringAmount);
        }

        if (isNoRecalculateNeeded(stringAmount)) {
            return;
        }

        if (isCurrency) {
            setCryptoAmount('');
        } else {
            setCurrencyAmount('');
        }
    };

    // submit form handler
    const onSubmit = event => {
        event.preventDefault();

        setIsAmountPending(true);

        const {
            session: { account, unfundedAccountId },
        } = d;

        const accountID = !account ? unfundedAccountId : account.accountId();

        const params = {
            base_currency_code: selectedCurrency.code,
            base_currency_amount: currencyAmount,
            currency_code: selectedCrypto.code,
            currency_amount: cryptoAmount,
            target_address: selectedCrypto.code === 'XLM' ? accountID : 'null',
        };

        return get(getEndpoint(ENDPOINTS.MOONPAY_TRANSACTION, params))
            .then(url => Object.assign(quote, url, { displayCode: selectedCrypto.display_code }))
            .then(modalParams => {
                setIsAmountPending(false);
                d.modal.handlers.activate('MoonpayModal', modalParams);
            })
            .catch(() => {
                setIsAmountPending(false);
                setInitError('An unknown error occurred due to which you cannot buy the crypto, try again in a moment');
            });
    };

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
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {isPending ? (
                        <div className="Loader_wrapper">
                            <div className="nk-spinner" />
                        </div>
                    ) : (
                        (initError || !isEnabled) ? (
                            <div className="error_msg_block">
                                <img src={images['icon-circle-fail']} alt="failed" />
                                <div className="error_title">Something went wrong</div>
                                <div className="error_text">
                                    {!isEnabled ?
                                        'Buying the crypto has temporarily disabled, try again in a moment' :
                                        'An unknown error occurred due to which you cannot buy the crypto, try again in a moment'
                                    }
                                </div>
                                <button onClick={() => initMoonpay()} className="s-btn_cancel">
                                    Reload
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={e => onSubmit(e)}>
                                <label htmlFor="currencyInput">
                                    <span>You pay</span>
                                    <span className={errorText ? 'label_error' : 'label_info'}>
                                        {errorText || limitsLabel}
                                    </span>
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
                                        onChange={e => onAmountChange(e, true)}
                                        placeholder={`Amount in ${selectedCurrency.display_code} you pay`}
                                    />

                                    <CurrencyDropdown
                                        popularCurrencies={sortedCurrencies.popular}
                                        nonPopularCurrencies={sortedCurrencies.nonPopular}
                                        selectedToken={selectedCurrency}
                                        changeFunc={token => onCurrencyChange(token)}
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
                                        onChange={e => onAmountChange(e, false)}
                                        placeholder={`Amount in ${selectedCrypto.display_code} you get`}
                                    />

                                    <CurrencyDropdown
                                        popularCurrencies={sortedCrypto.popular}
                                        nonPopularCurrencies={sortedCrypto.nonPopular}
                                        selectedToken={selectedCrypto}
                                        changeFunc={token => onCryptoChange(token)}
                                    />
                                </div>
                                <div className="form_footer">
                                    <div className="visa_mc_wrapper">
                                        <span>Accepted here</span>
                                        <img src={images['icon-visa-mc']} alt="credit-card" className="cards_logo" />
                                    </div>

                                    <button type="submit" className="s-button" disabled={isSubmitDisabled}>
                                        {isAmountPending ?
                                            <div className="nk-spinner" /> :
                                            `Buy ${selectedCrypto && selectedCrypto.display_code.toUpperCase()}`
                                        }
                                    </button>
                                </div>
                            </form>
                        )
                    )}
                </div>
            </div>

            <BuyCryptoStatic />
        </div>
    );
};

BuyCrypto.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

export default BuyCrypto;
