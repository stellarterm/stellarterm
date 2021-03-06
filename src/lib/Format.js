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
    return input < 0.000001
        ? _.round(input, exports.niceNumDecimals(input)).toFixed(7)
        : _.round(input, exports.niceNumDecimals(input));
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
 * @param {number} amount - Amount to validate
 * @param {number} precision - precision to validate
 * @returns {boolean} True, if valid number (ex) 1, 1.00, 20.55400
 */
exports.isValidToPrecision = function isValidToPrecision(amount, precision) {
    const regExpStr = Number(precision) === 0 ? '^\\d+$' : `^\\d+([.,]\\d{1,${precision}})?$`;
    const regExp = new RegExp(regExpStr);
    return regExp.test(amount.toString());
};

/**
 * Return true, if string should be set to input without recalculate
 * @param {string} amount string to validate
 * @param {number} precision of crypto code after .
 * @returns {boolean} True, if ex ("", "1.", "."), if precision 0, ex (1, 20, 50)
 */
exports.isNoRecalculateNeeded = function isNoRecalculateNeeded(amount, precision) {
    return precision && amount.length !== 1 && amount.slice(-1) === '.' && amount.split('.').length === 2;
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
