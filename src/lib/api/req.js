const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (d) => {
        body += d;
      });
      res.on('end', () => {
        resolve(body);
      });
    }).on('error', (e) => {
      reject(e);
    })
  });
}

function getJson(url) {
  return get(url)
    .then(body => {
      return JSON.parse(body);
    });
}

export default {
  get,
  getJson,
};
