'use strict';

const _ = require('lodash');

module.exports = (services, connections) => (req, res) => {
  try {
    req.logger.log('disconnect post : body = ', req.body);
    const service = services[req.body.type];
    const { session } = req.cookies;
    if (!service || !session) {
      req.logger.error(`No session in cookies or no service of type = ${req.body.type}`);
      res.sendStatus(400);
      return;
    }
    const { type, name } = req.body;
    const connection = _.find(connections, { session, type, name });
    if (!connection) {
      req.logger.error(`Connection doesn't exist for session ${session}, type = ${type}, name = ${name}`);
      res.sendStatus(400);
      return;
    }
    service.disconnect(connection, req);
    req.logger.log('disconnect post : OK, body = ', req.body);
    res.sendStatus(200);
  } catch (err) {
    req.logger.error(err);
    res.sendStatus(500);
  }
};
