var request = require('request');

var env = require('./lib/env');
var logger = require('./lib/logger');

/*
 * Helper method to get an access token from the Authorization Server.
 */
var getAccessToken = function(callback) {
  if (!env('AUTH0_DOMAIN')) {
    callback(new Error('The AUTH0_DOMAIN is required in order to get an access token (verify your configuration).'));
  }

  logger.debug('Fetching access token from https://' + env('AUTH0_DOMAIN') + '/oauth/token');

  var options = {
    method: 'POST',
    url: 'https://' + env('AUTH0_DOMAIN') + '/oauth/token',
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json'
    },
    body: {
      audience: env('RESOURCE_SERVER'),
      grant_type: 'client_credentials',
      client_id: env('AUTH0_CLIENT_ID'),
      client_secret: env('AUTH0_CLIENT_SECRET')
    },
    json: true
  };

  request(options, function(err, res, body) {
    if (err || res.statusCode < 200 || res.statusCode >= 300) {
      return callback(res && res.body || err);
    }

    callback(null, body.access_token);
  });
}

logger.info('Starting the Gift Deliveries worker.');

// Get the access token.
getAccessToken(function(err, accessToken) {
  if (err) {
    logger.error('Error getting a token:', err.message || err);
    return;
  }

  logger.info('Getting directions to the Auth0 Office from the World Mappers API');

  // Call the Worldmappers API with the access token.
  var options = {
    url: 'http://localhost:7001/api/directions?destination=Auth0%20Office',
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  }
  request.get(options, function(err, res, body) {
    if (err || res.statusCode < 200 || res.statusCode >= 300) {
      logger.error(res && res.body || err);
    } else {
      logger.info('Directions:', body);
    }
  });
})
