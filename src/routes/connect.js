'use strict';

const _ = require('lodash');

module.exports = (services, connections) => (req, res) => {
  req.logger.log('connect post, body : ', req.body);
  const { type, name } = req.body;
  const service = services[type];
  if (!service) {
    req.logger.error(`service ${type} not found`);
    res.sendStatus(400);
    return;
  }
  const { session } = req.cookies;
  const connection = _.find(connections, { session, type, name });
  if (!connection) {
    req.logger.error(`DataScource not found for session ${session}, type = ${type}, name = ${name}`);
    res.sendStatus(400);
    return;
  }
  if (connection.connected) {
    req.logger.log(`Connection already established for session ${session}, type = ${type}, name = ${name}`);
    res.status(200).json(service.createConnectedOKRespose(connection));
    return;
  }

  service.connect(req, res, session, connection)
    .then((response) => {
      if (response && response.connected) {
        req.logger.log('connect post : OK, response = ', response);
      } else {
        req.logger.log('connect post : Not Connected, response = ', response);
      }
    }).catch((err) => {
      req.logger.error(err);
      res.status(404).json({ err: 'Cannot establish connection', msg: err });
    });
};
