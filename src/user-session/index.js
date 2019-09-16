'use strict';

const _ = require('lodash');
const uuidv1 = require('uuid/v1');

const config = require('../settings/config.json');

const secret = process.env.SECRET || config.secret;
const port = process.env.PORT || config.port;
const dbUserPath = process.env.DB_USER_PATH || config.users;
const sessionTimeout = process.env.SESION_TIMEOUT || config.sessionTimeout;

// eslint-disable-next-line import/no-dynamic-require
const dbusers = require(dbUserPath);
const userSessions = [];

const genuuid = () => uuidv1;

const sessionHandler = () => (req, res, next) => {
  const { cookies } = req;

  let { session } = cookies;
  if (!session) {
    session = uuidv1();
  }

  let user = _.find(userSessions, { session });
  if (!user) {
    user = {
      session,
      loggedIn: false,
    };
    userSessions.push(user);
  }
  req.userSession = user;
  res.cookie('session', session, { maxAge: sessionTimeout, httpOnly: true });
  next();
};
module.exports = {
  sessionHandler, userSessions, dbusers, secret, port, genuuid, sessionTimeout,
};
