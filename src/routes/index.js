'use strict';

const express = require('express');

const connect = require('./connect');
const disconnect = require('./disconnect');
const request = require('./request');
const serviceState = require('./service-state');
const getServices = require('./get-services');
const getDataSources = require('./get-data-sources');
const createDataSource = require('./create-data-source');
const getTables = require('./get-tables');
const getSchemas = require('./get-schemas');
const { authLocal, passport, unless } = require('./auth');
const uploadDS = require('./upload-datasources');
const { logger } = require('../logger');
const { services, connections } = require('../services');

logger.log('Services loaded : ', services);

//--------------------------------------------------------------------
module.exports = () => {
  const apiRouter = express.Router();

  return apiRouter
    .use(unless())
    .post('/auth', passport.authenticate('local', { session: false }), authLocal())
    .post('/connect', connect(services, connections))
    .post('/disconnect', disconnect(services, connections))
    .post('/request', request(services, connections))
    .get('/service-state/:type/:name', serviceState(services, connections))
    .get('/get-services', getServices(services, connections))
    .post('/create-data-source', createDataSource(services, connections))
    .get('/get-data-sources', getDataSources(connections))
    .get('/get-tables', getTables(services, connections))
    .get('/get-schemas', getSchemas(services, connections))
    .post('/upload-datasources', uploadDS(services, connections));
};
