var http = require('http');
var path = require('path');
var morgan = require('morgan');
var logger = require('./logger');

var express = require('express');
var hbs = require('express-hbs');
var app = express();
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream: logger.stream
}));

app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

var nconf = require('nconf');
nconf.env()
  .file({ file: './config.json' })
	.defaults({
		PORT: 7002,
    CALLBACK_URL: "http://localhost:7002",
    ORGANIZER_BASE_URL: "http://localhost:7001"
	});

var callback_url = nconf.get('CALLBACK_URL');
var authorize_url = "https://{AUTH0_DOMAIN}/i/oauth2/authorize?scope=appointments%20contacts&response_type=token&client_id={AUTH0_CLIENT_ID}&redirect_uri={CALLBACK_URL}"
  .replace(/({AUTH0_DOMAIN})/g, nconf.get('AUTH0_DOMAIN'))
  .replace(/({AUTH0_CLIENT_ID})/g, nconf.get('AUTH0_CLIENT_ID'))
  .replace(/({CALLBACK_URL})/g, callback_url);

/*
* Serve HTML page.
*/
app.get('/', function(req, res, next) {
  res.render('index', {
    callback_url: callback_url,
    authorize_url: authorize_url,
    organizer_base_url: nconf.get('ORGANIZER_BASE_URL'),
    auth0_domain: nconf.get('AUTH0_DOMAIN'),
    auth0_client_id: nconf.get('AUTH0_CLIENT_ID')
  });
});

/*
 * Start server.
 */
http.createServer(app).listen(nconf.get('PORT'), function() {
  logger.info('CalendarApp (Client) listening on: http://localhost:' + nconf.get('PORT'));
});
