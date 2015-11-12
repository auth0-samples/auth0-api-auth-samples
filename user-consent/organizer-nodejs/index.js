var fs = require('fs');
var jwt = require('express-jwt');
var http = require('http');
var cors = require('cors');
var morgan = require('morgan');
var logger = require('./logger');
var publicKey = fs.readFileSync('./key.pem');

var express = require('express');
var app = express();
app.use(cors());
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream: logger.stream
}));

var nconf = require('nconf');
nconf.env()
  .file({ file: './config.json' });

/*
 * Middleware that will validate the incoming access token.
 */
var jwtCheck = jwt({
  secret: publicKey,
  audience: nconf.get('RESOURCE_SERVER'),
  issuer: 'https://' + nconf.get('AUTH0_DOMAIN') + '/'
});

/*
 * Middleware that checks if a scope is available in the current user.
 */
var requireScope = function(expected_scope){
  return function (req, res, next){
    if (!req.user || !req.user.scope.includes(expected_scope)){
      return next(new Error('Cannot perform action. Missing scope ' + expected_scope));
    }
    next();
  };
};

/*
 * API endpoints.
 */
app.use('/api', jwtCheck, function(req, res, next) {
  if (req.user) {
    logger.debug('Current user: ' + req.user.sub + ' (scope=' + req.user.scope + ')');
  }
  next();
});
app.get('/api/appointments', requireScope('appointments'), function(req, res, next) {
  res.json([
    { subject: 'Meet with Fabrikam', date: '2015-11-20' },
    { subject: 'Follow up on deal with Contoso', date: '2015-12-03' }
  ]);
});
app.get('/api/contacts', requireScope('contacts'), function(req, res, next) {
  res.json([
    { name: 'John Doe', email: 'john.doe@gmail.com' },
    { name: 'Jane Doe', email: 'jane.doe@gmail.com' }
  ]);
});
app.get('/api/tasks', requireScope('tasks'), function(req, res, next) {
  res.json([
    { title: 'Finish blog post', due_date: '2015-12-05' }
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
http.createServer(app).listen(7001, function() {
  logger.info('Organizer API (Resource Server) listening on: http://localhost:7001');
});
