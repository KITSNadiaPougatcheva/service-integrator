/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */

'use strict';

// postgre-service.js

const { Client } = require('pg');
const Service = require('./service.js');
const { logger } = require('../logger');

class PostgreService extends Service {
  constructor() {
    super();
    this.type = 'postgre';
    this.frames = {
      'create-data-source': '/static/postgre-data-source.html',
      operations: '/static/postgre-operations.html',
    };
    this.script = '/static/scripts/postgre.js';
    this.initialize = 'postgreReinit';
    this.PostgreClient = Client;
    logger.log('Service is loading. type = ', this.type);
  }

  connect(req, res, session, connection) {
    req.logger.log(`PostgreService.connect() : req.body = ${JSON.stringify(req.body)}, session = ${session}`);

    // let dburl = 'postgresql://testuser:1q2w3e4r5t@localhost/testdb';
    const dburl = {
      user: connection.config.user,
      host: connection.config.host,
      database: connection.config.dbname,
      password: connection.config.password,
      port: connection.config.port,
    };
    const db = new this.PostgreClient(dburl);
    return db.connect().then(() => {
      req.logger.log('Postgre Connection established OK');
      Object.assign(connection, {
        connected: true, dburl, db, lastUsed: new Date(),
      });
      const jsonResponse = super.createConnectedOKRespose(connection);
      res.json(jsonResponse);
      return jsonResponse;
    });
  }

  request(req, res, connection) {
    if (connection && connection.db && req.body.query) {
      let { query } = req.body;
      if (query.match(/^select/g)) {
        if (query && !query.match(/limit/g)) {
          query = `${req.body.query} limit ${req.body.limit || 20}`;
        }
        if (query && !query.match(/offset/g)) {
          query = `${req.body.query} offset ${req.body.offset || 0}`;
        }
      }
      return connection.db.query(query).then((result) => {
        res.json({ query, rows: result.rows });
        return JSON.stringify(result.rows);
      });
    } throw new Error('No connection to PostgrSQL established or Wrong request');
  }

  disconnect(connection) {
    if (connection.db && connection.connected) {
      connection.lastUsed = new Date();
      connection.connected = false;
      connection.db.end();
    }
  }

  tables(connection, req) {
    if (connection && connection.db) {
      const query = 'select table_name,table_schema from information_schema.tables '
+ "where table_schema not in ('pg_catalog','information_schema')";
      return connection.db.query(query).then((result) => {
        req.logger.log('Postgres Tables Result ', result);
        return result.rows;
      });
    } throw new Error('No connection to PostgrSQL established');
  }

  schemas(connection, req) {
    if (connection && connection.db) {
      const query = 'select schema_name from information_schema.schemata';
      return connection.db.query(query).then((result) => {
        req.logger.log('Postgres Schemas Result ', result);
        return result.rows;
      });
    } throw new Error('No connection to PostgrSQL established');
  }
}

module.exports = PostgreService;
