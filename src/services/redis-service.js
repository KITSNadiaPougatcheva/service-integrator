/* eslint-disable no-bitwise */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */

'use strict';

// redis-service.js

const redis = require('redis');
const bluebird = require('bluebird');

const Service = require('./service.js');
const { logger } = require('../logger');

bluebird.promisifyAll(redis);

class RedisService extends Service {
  constructor() {
    super();
    this.type = 'redis';
    this.frames = {
      'create-data-source': '/static/redis-data-source.html',
      operations: '/static/redis-operations.html',
    };
    this.script = '/static/scripts/redis.js';
    this.initialize = 'redisReinit';
    logger.log('Redis Service is loading. type = ', this.type);
    this.handlers = {
      set: (req, res, connection) => {
        const {
          key, value, ex, time,
        } = req.body;

        if (key && value) {
          if (~['EX', 'PX'].indexOf(ex)) {
            return connection.db.setAsync(key, value, ex, +time)
              .then(result => res.status(200).json(result));
          } if (~['XX', 'NX'].indexOf(ex)) {
            return connection.db.setAsync(key, value, ex)
              .then(result => res.status(200).json(result));
          } return connection.db.setAsync(key, value)
            .then(result => res.status(200).json(result));
        } return new Promise(() => res.status(400).send('Wrong request'));
      },
      load: (req, res, connection) => {
        const { key } = req.body;
        if (key) {
          return connection.db.getAsync(key).then((result) => {
            req.logger.log('Redis Load result', result);
            if (result) {
              res.status(200).json(result);
            } else {
              res.status(404).send('Value not found');
            }
          });
        } return new Promise(() => res.status(400).send('Wrong request'));
      },
      auth: (req, res, connection) => {
        if (req.body.password) {
          return new Promise(() => {
            connection.db.auth(req.body.password, (err, result) => {
              if (err) {
                res.status(400).send('Authentication failed');
                return;
              }
              req.logger.log('Redis Auth result', result);
              connection.auth_required = false;
              res.sendStatus(200);
            });
          });
        } return new Promise(() => res.status(400).send('Wrong request'));
      },
      command: (req, res, connection) => {
        const { command } = req.body;
        if (command && connection.db[command] && req.body.params) {
          const params = JSON.parse(req.body.params);
          return new Promise(() => {
            connection.db[command](params, (result) => {
              req.logger.log('Redis Command result', result);
              res.status(200).json(result || { result: 'OK' });
            });
          });
        } return new Promise(() => res.status(400).send('Wrong request'));
      },
    };
  }

  connect(req, res, session, connection) {
    req.logger.log(`RedisService.connect() : req.body = ${JSON.stringify(req.body)}, session = ${session}`);
    const {
      host, port, password, dbname,
    } = connection.config;
    const options = {
      host,
      port,
      no_ready_check: true,
    };
    if (dbname) {
      options.db = dbname;
    }
    if (password) {
      options.password = password;
    }
    const superClass = this;
    return Promise.resolve().then(() => redis.createClient(options))
      .then((client) => {
        client.on('connect', () => {
          if (!client.connected) {
            res.status(400).send('Cannot connect to Redis');
            client.quit();
            return;
          }
          req.logger.log('Redis connected');
          if (connection.config.password) {
            // it is required in redis.conf
            client.auth(connection.config.password, (result) => {
              req.logger.log('Redis Auth result', result);
              connection.auth_required = false;
            });
          }
          connection.connected = true;
          connection.lastUsed = new Date();
          connection.dburl = options;
          connection.db = client;
          const jsonResponse = superClass.createConnectedOKRespose(connection);
          res.json(jsonResponse);
        });
        client.on('error', (err) => {
          if (err.code === 'NOAUTH') {
            connection.auth_required = true;
            req.logger.error(`Redis auth is required : ${err}`);
            return;
          }
          connection.connected = false;
          req.logger.error(`Cannot connect to Redis : ${err}`);
          client.quit();
          if (!res.headersSent) {
            res.status(400).send(`Cannot connect to Redis : ${err}`);
          } else {
            req.logger.log('Tryed to send error response twice');
          }
        });
        return connection;
      });
  }

  request(req, res, connection) {
    const { operation } = req.body;
    if (connection && connection.db && connection.connected) {
      if (this.handlers[operation]) {
        return this.handlers[operation](req, res, connection);
      }
      return new Promise(() => res.status(400).send('Wrong request'));
    }
    throw new Error('No connection to Redis established');
  }

  disconnect(connection) {
    if (connection.db && connection.connected) {
      connection.connected = false;
      connection.db.end(true);
      connection.lastUsed = new Date();
    }
  }

  tables() {
    throw new Error('Not implemented');
  }

  schemas() {
    throw new Error('Not implemented');
  }
}

module.exports = RedisService;
