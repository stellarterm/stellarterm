const _ = require('lodash');

exports.niceRound = function niceRound(input) {
  if (input > 100) {
    return _.round(input, 2);
  }
  if (input > 10) {
    return _.round(input, 3);
  }
  if (input > 1) {
    return _.round(input, 4);
  }
  if (input > 0.1) {
    return _.round(input, 5);
  }
  if (input > 0.01) {
    return _.round(input, 6);
  }
  return _.round(input, 7);
};

exports.niceNumDecimals = function niceNumDecimals(input) {
  if (input > 100) {
    return 2;
  }
  if (input > 10) {
    return 3;
  }
  if (input > 1) {
    return 4;
  }
  if (input > 0.1) {
    return 5;
  }
  if (input > 0.01) {
    return 6;
  }
  return 7;
};

// Calculates the difference between two dates (input and now).
// Returns string with time since given date according to
// appropriate time interval: minutes, days, etc.
exports.daysSince = function daysSince(input) {
  const now = (new Date()).getTime();
  const date = (new Date(input)).getTime();

  const oneMinute = 1000 * 60;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;
  const oneYear = 365 * oneDay;

  // Time difference in milliseconds
  const timeDifferenceMS = now - date;

  const minutes = Math.round(timeDifferenceMS / oneMinute);
  const hours = Math.round(timeDifferenceMS / oneHour);
  const days = Math.round(timeDifferenceMS / oneDay);
  const years = Math.round(timeDifferenceMS / oneYear);

  // If minutes is 0, returns "Now"
  if (minutes < 60) {
    return minutes ? minutes + (minutes === 1 ? " Minute Ago" : " Minutes Ago") : "Now";
  }
  if (hours < 24) {
    return hours + (hours === 1 ? " Hour Ago" : " Hours Ago");
  }
  if (days < 365) {
    return days + (days === 1 ? " Day Ago" : " Days Ago");
  }
  return years + (years === 1 ? " Year Ago" : " Years Ago");
};
