'use strict';

// server.js
// for debug mode :
// start node --inspect server.js

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const session = require('express-session');

const apiRouter = require('./routes');
const errorHandler = require('./error-handler');
const { initLogger, useLogger } = require('./logger');
const { sessionHandler, genuuid, secret } = require('./user-session');
const { passport } = require('./routes/auth');

module.exports = () => {
  const app = express();
  initLogger(app);
  return app
    .use(useLogger())
    .use(cookieParser())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: false }))
    .use(express.json())
    .use(fileUpload({}))
    .use(session({
      genid: genuuid(),
      name: 'connect.SI',
      resave: true,
      saveUninitialized: true,
      secret,
    }))
    .use(passport.initialize())
    .use(passport.session())

    .use(sessionHandler())
    .use('/', apiRouter())
    .use(errorHandler())
    .use(express.static(`${__dirname}/../public-static`));
};
