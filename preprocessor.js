/* eslint-disable import/no-extraneous-dependencies */
const ReactTools = require('react-tools');

module.exports = {
  process(src) {
    return ReactTools.transform(src, {
      harmony: true,
    });
  },
};
