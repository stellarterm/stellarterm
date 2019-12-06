import moment from 'moment';
import _ from 'lodash';

// Shows at least 4 decimal places
// Never shows 1 because it looks weird.
exports.niceNumDecimals = function niceNumDecimals(input) {
    if (input >= 2000) {
        return 0;
    } else if (input >= 10) {
        return 2;
    } else if (input >= 1) {
        return 3;
    } else if (input >= 0.1) {
        return 4;
    } else if (input >= 0.01) {
        return 5;
    } else if (input >= 0.001) {
        return 6;
    }
    return 7;
};

exports.niceRound = function niceRound(input) {
    const decimal = exports.niceNumDecimals(input);
    if (decimal === 7) {
        return parseFloat(input).toFixed(decimal);
    }
    return _.round(input, decimal);
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
