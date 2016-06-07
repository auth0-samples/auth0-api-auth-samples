const jwt = require('express-jwt');
const http = require('http');
const morgan = require('morgan');

const env = require('./lib/env');
const logger = require('./lib/logger');
const getPublicKey = require('./lib/getPublicKey');
const requireScope = require('./lib/middleware/requireScope');

/*
 * Initialize express.
 */
const express = require('express');
const app = express();
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream: logger.stream
}));

/*
 * Middleware that will validate the incoming access token.
 */
const jwtCheck = jwt({
  secret: getPublicKey(env('AUTH0_DOMAIN')),
  audience: env('RESOURCE_SERVER'),
  algorithms: [ 'RS256' ],
  issuer: `https://${env('AUTH0_DOMAIN')}/`
});

/*
 * API endpoints.
 */
app.use('/api', jwtCheck, function(req, res, next) {
  if (req.user) {
    logger.debug('Current user: ' + req.user.sub + ' (scope=' + (req.user.scope || 'N/A') + ')');
  }
  next();
});
app.get('/api/location/geocode', requireScope('geocode:location'), function(req, res, next) {
  res.json({
    lat: 47.6178819,
    lng: -122.194041
  });
});
app.get('/api/location/reverse-geocode', requireScope('reverse-geocode:location'), function(req, res, next) {
  res.json({
    street: '10900 NE 8th Street',
    city: 'Bellevue',
    state: 'Washington'
  });
});
app.get('/api/directions', requireScope('directions'), function(req, res, next) {
  res.json([
    { step: 1, action: 'Turn left' },
    { step: 2, action: 'Turn right' },
    { step: 3, action: 'Finish' }
  ]);
});

/*
 * Error handler
 */
app.use(function(err, req, res, next) {
  if (err) {
    logger.error('Unauthorized:', err.message);
    return res.status(401).send({ message: err.message });
  }

  next(err, req, res);
});

/*
 * Start server.
 */
http.createServer(app).listen(env('PORT'), function() {
  logger.info('Worldmappers API (Resource Server) listening on: http://localhost:' + env('PORT'));
});
