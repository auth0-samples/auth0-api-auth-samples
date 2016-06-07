var ms = require('ms');
var request = require('request');

var logger = require('./logger');

function certToPEM (cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = "-----BEGIN CERTIFICATE-----\n" + cert;
  cert = cert + "\n-----END CERTIFICATE-----\n";
  return cert;
}

function getPublicKeyFromJwks(domain, callback) {
  var options = {
    url: 'https://' + domain + '/.well-known/jwks.json',
    json: true
  };

  logger.debug('Loading public key from: https://' + domain + '/.well-known/jwks.json')
  request(options, function(err, res) {
    if (err || res.statusCode < 200 || res.statusCode >= 300) {
      return callback(res && res.body || err);
    }

    var key = res.body.keys.find((key) => key.alg === 'RS256');
    if (!key) {
      return callback(new Error('Unable to find public key for: ' + domain));
    }

    return callback(null, certToPEM(key.x5c[0]));
  });
}

module.exports = function(domain) {
  if (!domain) {
    throw new Error('The domain is required in order to load the public key.');
  }

  var jwksError = null;
  var jwksPublicKey = null;

  // Fetch the public key every 10 hours to support key rotation.
  const getPublicKey = function() {
    getPublicKeyFromJwks(domain, function(err, publicKey) {
      if (err) {
        jwksError = err;
        logger.error('Error loading public key for: ' + domain, err);
      } else {
        jwksPublicKey = publicKey;
        logger.debug('Loaded public key for: ' + domain);
      }
    });
  };
  getPublicKey();
  setInterval(getPublicKey, ms('10h'));

  // Function to return the public key.
  return function(req, header, payload, cb) {
    if (!jwksPublicKey) {
      return cb(err || new Error('Public key not available.'));
    }

    return cb(null, jwksPublicKey);
  }
};
