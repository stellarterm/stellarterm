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
