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
