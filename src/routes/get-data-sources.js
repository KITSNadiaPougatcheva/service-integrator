'use strict';

// get-data-sources.js

const _ = require('lodash');

module.exports = connections => (req, res) => {
  try {
    req.logger.log('get-data-sources get');

    const { session } = req.cookies;
    if (session) {
      const sessionConnections = _.filter(connections, { session });
      if (!sessionConnections) {
        req.logger.error(`No Datasources exist for session ${session}`);
        res.sendStatus(400);
        return;
      }
      const retConnections = [];
      sessionConnections.forEach((item) => {
        const curConnection = Object.assign(_.omit(item.config, 'password'), { connected: item.connected });
        retConnections.push(curConnection);
      });
      res.status(200).json(retConnections);
    }
  } catch (err) {
    req.logger.error(err);
    res.sendStatus(500);
  }
};
