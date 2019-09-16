'use strict';

const _ = require('lodash');

module.exports = (services, connections) => (req, res) => {
  const { type, name } = req.query;
  req.logger.log(`get-tables get. type = ${type}, name = ${name}`);
  const service = services[req.query.type];
  if (!service || !req.cookies || !req.cookies.session) {
    req.logger.error(`No session in cookies or no service of type = ${type}`);
    res.sendStatus(400);
    return;
  }
  const { session } = req.cookies;
  const connection = _.find(connections, { session, type, name });
  if (!connection || !connection.connected) {
    req.logger.error(`Connection doesn't exist for session ${session}, type = ${type}`);
    res.status(400).send(`Connection doesn't exist for session ${session}, type = ${type}`);
    return;
  }
  service.tables(connection, req)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
};
