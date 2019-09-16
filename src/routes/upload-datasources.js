'use strict';

const _ = require('lodash');

module.exports = (services, connections) => (req, res) => {
  req.logger.log(`upload-datasources post : body = ${req.body}`);
  const dataSourceContent = req.files.file.data.toString();
  const dsSet = JSON.parse(dataSourceContent);
  if (!dsSet) {
    req.logger.log('No connections in uploaded file');
    res.status(200).json({});
    return;
  }
  const { session } = req.cookies;
  const retConnections = [];
  const keys = Object.keys(dsSet);
  keys.forEach((key) => {
    const datasource = dsSet[key];
    const { type, name } = datasource;
    if (datasource && type && name) {
      const service = services[type];
      if (!service) {
        req.logger.error(`service ${type} not found`);
        return;
      }
      let connection = _.find(connections, { session, type, name });
      if (connection) {
        req.logger.log(`DataSource already exists for name = ${name} and type = ${type} and will be removed`);
        if (connection.connected) {
          req.logger.log(`Connection state is 'Connected' for name = ${name} and type = ${type} and will be disconnected`);
          service.disconnect(req, connection);
        }
        _.remove(connections, obj => _.isMatch(obj, { session, type, name }));
      }
      connection = {
        session,
        type,
        name,
        lastUsed: new Date(),
        connected: false,
        config: _.omit(datasource, 'connected'),
      };
      connections.push(connection);
      retConnections.push(Object.assign(_.omit(datasource, 'password'), { connected: false }));
    }
  });
  res.status(200).json(retConnections);
};
