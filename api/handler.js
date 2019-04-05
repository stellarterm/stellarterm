'use strict';

const tickerGenerator = require('./functions/ticker');
const fetch = require('node-fetch');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const _ = require('lodash');

const s3 = new AWS.S3();

module.exports.ticker = (event, context, callback) => {
  tickerGenerator()
    .then(files => {
      return Promise.all(_.map(files, (contents, filename) => {
        return s3.putObject({
          Bucket: process.env.BUCKET,
          Key: filename,
          Body: contents,
          ContentType: 'application/json',
          ACL: 'public-read',
          CacheControl: 'public, max-age=50',
        }).promise()
      }))
    })
    .then(v => callback(null, v), callback);
};
