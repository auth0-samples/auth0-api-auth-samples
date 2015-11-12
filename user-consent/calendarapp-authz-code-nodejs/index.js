var jwt = require('jsonwebtoken');
var http = require('http');
var path = require('path');
var morgan = require('morgan');
var logger = require('./logger');
var request = require('request');

var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var oauth2 = require('passport-oauth2');
var hbs = require('express-hbs');

var app = express();
app.use(cookieParser());
app.use(session({ secret: 'shhhhhhhhh' }));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
	stream: logger.stream
}));

app.engine('hbs', hbs.express4({
	defaultLayout: path.join(__dirname, 'views/layout/default.hbs')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

var nconf = require('nconf');
nconf.env()
  .file({ file: './config.json' });
/*
 * Configure passport.
 */
passport.serializeUser(function(user, done) {
	console.log('serialize user');
  done(null, user);
});
passport.deserializeUser(function(user, done) {
	console.log('deserialize user');
  done(null, user);
});
passport.use(new oauth2.Strategy({
  authorizationURL: 'https://' + nconf.get('AUTH0_DOMAIN') + '/i/oauth2/authorize',
  tokenURL: 'https://' + nconf.get('AUTH0_DOMAIN') + '/oauth/token',
  clientID: nconf.get('AUTH0_CLIENT_ID'),
  clientSecret: nconf.get('AUTH0_CLIENT_SECRET'),
  callbackURL: "http://localhost:7003/auth/organizer/callback",
  skipUserProfile: true
}, function(accessToken, refreshToken, profile, done) {
  var payload = jwt.decode(accessToken);

  logger.info('Token received for:', payload.sub);

  done(null, {
    id: payload.sub,
    access_token: accessToken
  });
}));

/*
 * Initialize passport.
 */
app.use(passport.initialize());
app.use(passport.session());

/*
 * Middleware to require authentication.
 */
var requiresLogin = function(req, res, next) {
  console.log(req.user);
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
};

/*
 * Pages
 */
app.get('/', function(req, res, next) {
  res.render('index');
});

app.get('/account', requiresLogin, function(req, res, next) {
  res.render('account', {
		user: req.user,
    user_json: JSON.stringify(req.user, null, 2),
    access_token: req.user.access_token,
    access_token_payload: JSON.stringify(jwt.decode(req.user.access_token), null, 2)
  });
});

app.get('/appointments', requiresLogin, function(req, res, next) {
	request({
		url: nconf.get('ORGANIZER_BASE_URL') + '/api/appointments',
		json: true,
		headers: {
			'Authorization': 'Bearer ' + req.user.access_token
		}
	}, function(error, response, body) {
		if (error) {
			logger.error(error);
			return res.status(500);
		} else {
		  res.render('appointments', {
				user: req.user,
				appointments: JSON.stringify(body, null, 2)
		  });
		}
	});
});

app.get('/contacts', requiresLogin, function(req, res, next) {
	request({
		url: nconf.get('ORGANIZER_BASE_URL') + '/api/contacts',
		json: true,
		headers: {
			'Authorization': 'Bearer ' + req.user.access_token
		}
	}, function(error, response, body) {
		if (error) {
			logger.error(error);
			return res.status(500);
		} else {
		  res.render('contacts', {
				user: req.user,
				contacts: JSON.stringify(body, null, 2)
		  });
		}
	});
});

app.get('/tasks', requiresLogin, function(req, res, next) {
	request({
		url: nconf.get('ORGANIZER_BASE_URL') + '/api/tasks',
		json: true,
		headers: {
			'Authorization': 'Bearer ' + req.user.access_token
		}
	}, function(error, response, body) {
		if (error) {
			logger.error(error);
			return res.status(500);
		} else {
		  res.render('tasks', {
				user: req.user,
				tasks: JSON.stringify(body, null, 2)
		  });
		}
	});
});

/*
 * Login with 'Organizer' (the Resource Server)
 */
app.get('/auth/organizer',
  passport.authenticate('oauth2', { scope: 'appointments contacts openid email' }));

/*
 * Handle callback from the Authorization Server.
 */
app.get('/auth/organizer/callback',
  passport.authenticate('oauth2', { failureRedirect: '/' }),
  function(req, res) {
    logger.debug('Login:', req.user.access_token);
    res.redirect('/account');
  });
/*
 * Start server.
 */
http.createServer(app).listen(7003, function() {
	logger.info('CalendarApp listening on: http://localhost:7003/');
  logger.info(' > Mode: client - authorization code grant');
});
