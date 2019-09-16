'use strict';

const _ = require('lodash');

module.exports = (services, connections) => (req, res) => {
  try {
    req.logger.log('request post : body = ', req.body);
    const { type, name } = req.body;
    const service = services[type];
    const { session } = req.cookies;
    if (!service || !session) {
      req.logger.error(`No session in cookies or no service of type = ${type}`);
      res.sendStatus(400);
      return;
    }
    const connection = _.find(connections, { session, type, name });

    if (!connection) {
      req.logger.error(`Connection doesn't exist for session ${session}, type = ${type}, name = ${name}`);
      res.sendStatus(400);
    } else if (!connection.connected) {
      res.status(400).send('Not connected');
    } else {
      connection.lastUsed = new Date();
      service.request(req, res, connection)
        .then(() => {
          req.logger.log('request processed OK');
        })
        .catch(err => res.status(404).json(err));
    }
  } catch (err) {
    req.logger.error(err);
    res.sendStatus(500);
  }
};
