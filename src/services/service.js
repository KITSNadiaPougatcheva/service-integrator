/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */

'use strict';

// service.js

class Service {
  connect(req, res, session, connection) {
    throw new Error('Not Implemented');
  }

  request(req, res, connection) {
    throw new Error('Not Implemented');
  }

  tables(connection) {
    throw new Error('Not Implemented');
  }

  schemas(connection) {
    throw new Error('Not Implemented');
  }

  disconnect(connection, req) {
    throw new Error('Not Implemented');
  }

  createConnectedOKRespose(connection) {
    const curConnection = Object.assign({}, connection.config, { connected: connection.connected });
    delete curConnection.password;
    return curConnection;
  }
}

module.exports = Service;
