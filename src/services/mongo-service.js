/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */

'use strict';

// mongo-service.js

const _ = require('lodash');
const mongoClient = require('mongodb').MongoClient;
const { logger } = require('../logger');
const Service = require('./service.js');

class MongoService extends Service {
  constructor() {
    super();
    this.type = 'mongo';
    this.frames = {
      'create-data-source': '/static/mongo-data-source.html',
      operations: '/static/mongo-operations.html',
    };
    this.script = '/static/scripts/mongo.js';
    this.initialize = 'mongoReinit';
    logger.log('Service is loading. type = ', this.type);
  }

  connect(req, res, session, connection) {
    req.logger.log(`MongoService.connect() : req.body = ${JSON.stringify(req.body)}, session = ${session}`);
    const {
      user, password, host, port, dbname,
    } = connection.config;
    // let dburl = 'mongodb://testuser:1q2w3e4r5t@localhost:27017/testdb';
    const dburl = `mongodb://${user}:${password}@${host}:${port}/${dbname}`;
    req.logger.log('Mongo : dburl = ', dburl);

    return mongoClient.connect(dburl, { useNewUrlParser: true }).then((conn) => {
      req.logger.log('MongoDB Connection established OK');
      connection.connected = true;
      connection.lastUsed = new Date();
      connection.dburl = dburl;
      const db = conn.db(dbname);
      connection.conn = conn;
      connection.db = db;
      const jsonResponse = super.createConnectedOKRespose(connection);
      res.json(jsonResponse);
      return jsonResponse;
    });
  }

  request(req, res, connection) {
    if (connection && connection.db && connection.connected) {
      req.logger.log(`MongoService.request() : req.body = ${JSON.stringify(req.body)}`);
      if (req.body.operation === 'collection-values') {
        return new Promise((resolve, reject) => {
          const condition = JSON.parse(req.body.condition || '{}');
          const collection = connection.db.collection(req.body.collection);
          collection.find(condition) // add range for 20 first results
            .limit(+(req.body.limit || 20))
            .skip(+(req.body.offset || 0))
            .toArray((err, result) => {
              if (err) {
                reject(err);
                return;
              }
              req.logger.log(result);
              res.json(result);
              resolve(result);
            });
        })
          .catch(err => res.status(400).send(err.message));
      }
      return new Promise(() => {
        res.status(400).send('Wrong request');
      });
    }
    throw new Error('No connection to Mongo established');
  }

  disconnect(connection) {
    if (connection && connection.db && connection.connected) {
      connection.conn.close();
      connection.connected = false;
      connection.lastUsed = new Date();
    }
  }

  schemas(connection, req) {
    if (connection.db && connection.connected) {
      return new Promise((resolve, reject) => {
        connection.db.listCollections().toArray((err, names) => {
          if (err) {
            reject(err);
            return;
          }
          req.logger.log(names);
          const arrNames = _.transform(names, (result, n) => {
            if (n.name) { result.push(n.name); }
          }, []);
          resolve(arrNames);
        });
      });
    }
    throw new Error('No connection to Mongo established');
  }
}

module.exports = MongoService;
