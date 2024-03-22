import _ from 'lodash';
import moment from 'moment';

// Shows at least 4 decimal places
// Never shows 1 because it looks weird.
exports.niceNumDecimals = function niceNumDecimals(input) {
    if (input >= 2000) {
        return 0;
    }
    if (input >= 10) {
        return 2;
    }
    if (input >= 1) {
        return 3;
    }
    if (input >= 0.1) {
        return 4;
    }
    if (input >= 0.01) {
        return 5;
    }
    if (input >= 0.001) {
        return 6;
    }
    return 7;
};

exports.niceRound = function niceRound(input) {
    if (Number(input) === 0) {
        return 0;
    }
    return input < 0.000001
        ? _.round(input, exports.niceNumDecimals(input)).toFixed(7)
        : _.round(input, exports.niceNumDecimals(input));
};

exports.formatNumber = function formatNumber(input) {
    if (Number(input) === 0) {
        return 0;
    }
    return Number(input).toLocaleString('en-US', {
        maximumFractionDigits: 7,
    });
};

exports.formatInputNumber = function formatInputNumber(input) {
    const parsed = parseFloat(input).toString();
    if (!parsed.includes('e')) {
        return parsed;
    }

    return Number(input).toFixed(7);
};

function nFormatter(num, digits) {
    const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'K' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'B' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'Q' },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup.slice().reverse().find(i => num >= i.value);
    return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}

exports.roundAndFormat = function roundAndFormat(input, withPostfix, postfixThreshold) {
    if (withPostfix && input >= (postfixThreshold || 1e9)) {
        return nFormatter(input, 2);
    }
    const rounded = exports.niceRound(input);

    return rounded.toLocaleString('en-US', {
        maximumFractionDigits: 7,
    });
};

exports.roundAndFormatPrice = function roundAndFormatPrice(input, threshold) {
    if (threshold && input >= threshold) {
        return nFormatter(input, 2);
    }

    return exports.formatNumber(input);
};

exports.getCurrentYear = function getCurrentYear() {
    return new Date().getFullYear();
};

// Input a date object and output a formatted date object for display purposes
// EX: { time: 11:15 AM, date: 12/07/17}
exports.niceDate = function niceDate(input) {
    if (moment(input).isValid()) {
        const date = moment(input).format('MM/DD/YY');
        const time = moment(input).format('LT');
        const offsetHours = moment(input).utcOffset() / 60;
        const timezone = offsetHours > 0 ? `UTC+${offsetHours}` : `UTC${offsetHours || ''}`;

        return {
            date,
            time,
            timezone,
        };
    }

    return {
        date: '',
        time: '',
        timezone: '',
    };
};

/**
 * Return true, if string is valid float number with precision
 * @param {string} amount - Amount to validate
 * @param {number} precision - precision to validate
 * @returns {boolean} True, if valid number (ex) 1, 1.00, 20.55400
 */
exports.isValidToPrecision = function isValidToPrecision(amount, precision) {
    const [, fractionalPart] = amount.split('.');

    return !fractionalPart || fractionalPart.length <= precision;
};

/**
 * Return true, if string should be set to input without recalculate
 * @param {string} amount string to validate
 * @returns {boolean} True, if ex ("", "1.", "."), if precision 0, ex (1, 20, 50)
 */
exports.isNoRecalculateNeeded = function isNoRecalculateNeeded(amount) {
    return amount.length !== 1 && amount.slice(-1) === '.' && amount.split('.').length === 2;
};

/**
 * Return 24h change of asset price
 * @param {object} asset complete asset object
 * @param {object} ticker complete ticker data object
 * @returns {string} String with percent change of asset 24h price, positive or negative
 */
exports.get24hChangePercent = function get24hChangePercent(asset, ticker) {
    const isNativeXlm = asset.id === 'XLM-native';
    const changePercent = isNativeXlm ? ticker.data._meta.externalPrices.USD_XLM_change : asset.change24h_USD;
    return (changePercent && changePercent.toFixed(2)) || '0.00';
};
