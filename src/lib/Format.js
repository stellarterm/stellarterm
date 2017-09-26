const _ = require('lodash');

exports.niceRound = function niceRound(input) {
  console.log(input)
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
