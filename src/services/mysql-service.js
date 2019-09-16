/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */

'use strict';

// mysql-service.js

const mysql = require('mysql');

const Service = require('./service.js');
const { logger } = require('../logger');

class MysqlService extends Service {
  constructor() {
    super();
    this.type = 'mysql';
    this.frames = {
      'create-data-source': '/static/mysql-data-source.html',
      operations: '/static/mysql-operations.html',
    };
    this.script = '/static/scripts/mysql.js';
    this.initialize = 'mysqlReinit';
    logger.log('Service is loading. type = ', this.type);
  }

  connect(req, res, session, connection) {
    req.logger.log(`MysqlService.connect() : req.body = ${JSON.stringify(req.body)}, session = ${session}`);

    const dburl = {
      host: connection.config.host,
      user: connection.config.user,
      password: connection.config.password,
      database: connection.config.dbname,
      port: connection.config.port,
    };
    const db = mysql.createConnection(dburl);
    return new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) {
          reject(err);
          return;
        }
        req.logger.log('MySQL Connection established OK', dburl);
        Object.assign(connection, {
          connected: true, db, dburl, lastUsed: new Date(),
        });
        const jsonResponse = super.createConnectedOKRespose(connection);
        res.json(jsonResponse);
        resolve(jsonResponse);
      });
    });
  }

  request(req, res, connection) {
    if (connection && connection.db && connection.connected && req.body.query) {
      req.logger.log(`MysqlService.request() : req.body = ${JSON.stringify(req.body)}`);
      if (req.body.operation === 'query') {
        return new Promise((resolve, reject) => {
          let { query } = req.body;
          if (query.match(/^select/g)) {
            if (!query.match(/limit/g)) {
              query += ' LIMIT 20';
            }
            if (!query.match(/offset/g)) {
              query += ' OFFSET 0';
            }
          }
          connection.db.query(query, (error, results) => {
            if (error) {
              reject(error);
              return;
            }
            req.logger.log('Records found: ', results.length);
            res.status(200).json(results);
            resolve(results);
          });
        });
      }
      return new Promise(() => { res.status(400).send('Wrong request'); });
    }
    throw new Error('No connection to Mongo established');
  }

  disconnect(connection) {
    if (connection.db && connection.connected) {
      connection.db.end();
      connection.connected = false;
      connection.lastUsed = new Date();
    }
  }

  tables(connection) {
    if (connection && connection.db && connection.connected) {
      return new Promise((resolve, reject) => {
        connection.db.query('SHOW TABLES;', (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    }
    throw new Error('No connection to Mysql established');
  }

  schemas(connection) {
    if (connection && connection.db && connection.connected) {
      return new Promise((resolve, reject) => {
        connection.db.query('SHOW SCHEMAS;', (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    }
    throw new Error('No connection to Mysql established');
  }
}

module.exports = MysqlService;
