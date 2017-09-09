'use strict';

const tickerGenerator = require('./tickerGenerator');
const fetch = require('node-fetch');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const s3 = new AWS.S3();

module.exports.ticker = (event, context, callback) => {
  tickerGenerator()
    .then(buffer => (
      s3.putObject({
        Bucket: process.env.BUCKET,
        Key: process.env.FILENAME,
        Body: buffer,
        ContentType: 'application/json',
        ACL: 'public-read',
      }).promise()
    ))
    .then(v => callback(null, v), callback);
};
