'use strict';

// create-data-source.js

const _ = require('lodash');

module.exports = (services, connections) => (req, res) => {
  try {
    req.logger.log('create-data-source post, body : ', req.body);
    if (!req.body.name || !req.body.type) {
      req.logger.error(`service ${req.body.type} not found`);
      res.status(400).send('Name and type should be speified');
      return;
    }
    const service = services[req.body.type];
    if (!service) {
      req.logger.error(`service ${req.body.type} not found`);
      res.status(400).send('Service not found');
      return;
    }
    const { session } = req.cookies;
    const { type, name } = req.body;
    if (session) {
      let connection = _.find(connections, { session, type, name });
      if (connection) {
        if (connection.connected) {
          req.logger.log(`Disconnecting Datasource with the name ${name}, session ${session}, type = ${type}`);
          service.disconnect(req, connection);
        }
        _.remove(connections, obj => _.isMatch(obj, { session, type, name }));
        req.logger.log(`Previous Datasource with the same name ${name} has been removed. New DataSource is going to be create for session ${session}, type = ${type}`);
      }
      connection = {
        session,
        type,
        name,
        lastUsed: new Date(),
        connected: false,
        config: { ...req.body },
      };
      const retConnection = Object.assign(_.omit(req.body, 'password'), { connected: false });
      connections.push(connection);
      res.status(200).json(retConnection);
    }
  } catch (err) {
    req.logger.error(err);
    res.sendStatus(500);
  }
};
