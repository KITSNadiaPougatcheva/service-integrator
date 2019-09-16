'use strict';

// auth.js

const _ = require('lodash');
const jwtSimple = require('jwt-simple');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const {
  userSessions, dbusers, secret: jwtsecret, sessionTimeout,
} = require('../user-session');

const encode = function encode(user) {
  return jwtSimple.encode(user, jwtsecret);
};

const decode = function decode(token) {
  return jwtSimple.decode(token, jwtsecret);
};

const authorizationOK = function authorizationOK(user) {
  return {
    username: user.username,
    token: user.token,
  };
};

module.exports.authLocal = () => {
  const setLoggedIn = function setLoggedIn(user, userSession, token) {
    const { id, username, loggedDate } = user;
    Object.assign(userSession, {
      token, loggedIn: true, loggedDate, lastUsedDate: new Date(), id, username,
    });
    return userSession;
  };

  return (req, res) => {
    req.logger.log('router POST auth : ', req.body);
    const { user, userSession } = req;
    res.json(authorizationOK(setLoggedIn(user, userSession, encode(user)))); // returns token
    req.logger.log('userName = ', req.body.username, ', user = ', user, ', userSession = ', userSession);
  };
};

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true,
  session: false,
}, (req, username, password, done) => {
  const employee = _.find(dbusers, { username });
  req.logger.log('Local Strategy function : userName = ', username, ', employee = ', employee);
  if (employee === undefined || employee.password !== password) {
    done(null, false, 'Bad username/password combination');
  } else {
    const user = Object.assign({}, employee, { loggedDate: (new Date()).getTime() });
    done(null, user);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = _.find(dbusers, { id });
  if (user) { done(null, user); } else { done('Not Found'); }
});

module.exports.passport = passport;

// --------------------------------------------

const setUserSessionExpired = function setUserSessionExpired(res, user) {
  if ((new Date()).getTime() - user.lastUsedDate.getTime() > sessionTimeout) {
    res.status(401).send('Session expired');
    // eslint-disable-next-line no-param-reassign
    user.loggedIn = false;
    return true;
  }
  return false;
};

// middleware for token check
const checkToken = function checkToken(req, res, next) {
  try {
    if (req.headers['x-access-token']) {
      const decodedToken = decode(req.headers['x-access-token']);
      req.logger.log('router GET users. Decoded token : ', decodedToken);

      if (decodedToken) {
        const { session } = req.cookies;
        const { id, username, loggedDate } = decodedToken;
        const user = _.find(userSessions, { id, username, session });
        if (user && user.loggedIn && loggedDate === user.loggedDate) {
          if (setUserSessionExpired(res, user)) {
            req.logger.log('Session expired');
            return;
          }
          user.lastUsedDate = new Date();
          req.user = user;
          next();
          return;
        }
        const anySessionUser = _.find(userSessions, { id, username, loggedDate });
        if (anySessionUser && anySessionUser.loggedIn
          && setUserSessionExpired(res, anySessionUser)) {
          return;
        }
      }
    }
    res.status(401).send('Unauthorized !!!');
  } catch (err) {
    req.logger.error('Error verifying token :', err);
    res.status(401).send('ERROR !!!');
  }
};

const noAuthServices = ['/auth', '/auth/', '/get-services', '/get-services/', '/'];
const noAuthResources = ['/static/'];
const unless = function unless() {
  return (req, res, next) => {
    const pathCheck = noAuthServices.some(path => path === req.path);
    const resourceCheck = noAuthResources.some(path => req.path.startsWith(path));
    req.logger.log(`unless() check : path = ${req.path}, pathCheck = ${pathCheck}, resourceCheck = ${resourceCheck}`);
    return (pathCheck || resourceCheck ? next() : checkToken(req, res, next));
  };
};

module.exports.unless = unless;
