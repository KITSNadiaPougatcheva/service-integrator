'use strict';

const _ = require('lodash');
const Service = require('../services/service.js');

module.exports = (services, connections) => (req, res) => {
  try {
    const { session } = req.cookies;
    const { type, name } = req.params;
    req.logger.log(`service-state get : name = ${name}, type = ${type}`);
    const connection = _.find(connections, { session, type, name });
    if (!connection) {
      req.logger.error(`DataScource not found for session ${session}, type = ${type}, name = ${name}`);
      res.sendStatus(400);
      return;
    }
    res.status(200).json(Service.createConnectedOKRespose(connection.config));
  } catch (err) {
    req.logger.error(err);
    res.sendStatus(500);
  }
};
