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

// Input a date object and output a formatted date object for display purposes
// EX: { time: 11:15 AM, date: 12/07/17}
exports.niceDate = function niceDate(input) {
  const date = (new Date(input)).toLocaleString()
  const splitDate = date.split(",");
  return {
    time: splitDate[1].split(":").slice(0,2).join(":") + " " + splitDate[1].split(":")[2].split(" ")[1],
    date: splitDate[0]
  }
};
