const _ = require('lodash');

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
  return _.round(input, exports.niceNumDecimals(input));
};


// Input a date object and output a formatted date object for display purposes
// EX: { time: 11:15 AM, date: 12/07/17}
exports.niceDate = function niceDate(input) {
  try {
    const date = (new Date(input)).toLocaleString()
    const splitDate = date.split(",");

    let offsetHours = (new Date(input)).getTimezoneOffset() / 60
    let timezone = 'UTC';
    if (offsetHours > 0) {
      timezone += '+' + offsetHours
    }

    if (offsetHours < 0) {
      timezone += '-' + offsetHours
    }
    return {
      date: splitDate[0],
      time: splitDate[1].split(":").slice(0,2).join(":") + " " + splitDate[1].split(":")[2].split(" ")[1],
      timezone: timezone,
    };
  } catch (e) {
    return {
      date: '',
      time: '',
      timezone: '',
    };
  }
};
