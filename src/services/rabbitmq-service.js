/* eslint-disable class-methods-use-this */

'use strict';

// rabbitmq-service.js

const amqp = require('amqplib');
const Service = require('./service.js');
const { logger } = require('../logger');

// eslint-disable-next-line max-len
/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["connection"] }] */
class RabbitService extends Service {
  constructor() {
    super();
    this.type = 'rabbitmq';
    this.frames = {
      'create-data-source': '/static/rabbit-data-source.html',
      operations: '/static/rabbit-operations.html',
    };
    this.script = '/static/scripts/rabbit.js';
    this.initialize = 'rabbitReinit';
    this.rabbitClient = amqp;
    logger.log('RabbitMQ Service is loading. type = ', this.type);

    this.handlers = {
      produce: (req, res, connection) => {
        const { queue, msg } = req.body;
        if (queue && msg) {
          return connection.db.assertQueue(queue)
            .then(() => connection.db.sendToQueue(queue, Buffer.from(msg)))
            .then((result) => {
              res.status(200).json(result);
            });
        }
        return new Promise(() => res.status(400).send('Wrong request'));
      },

      'start-consumer': (req, res, connection) => {
        if (req.body.queue) {
          return connection.db.assertQueue(req.body.queue).then(() => {
            // eslint-disable-next-line no-param-reassign
            connection.consumers[req.body.queue] = connection.consumers[req.body.queue] || [];
            return connection.db.consume(req.body.queue, (msg) => {
              if (msg !== null) {
                req.logger.log('Consumed msg : ', msg.content.toString());
                connection.consumers[req.body.queue].push(msg.content.toString());
                connection.db.ack(msg);
              }
            });
          }).then((result) => {
            res.status(200).send('Consumer started OK');
            req.logger.log('Consumer started with result result : ', result);
          }).catch((err) => {
            throw new Error('Cannot start consumer :', err);
          });
        }
        return new Promise(() => res.status(400).send('Wrong request'));
      },
      'get-consumed': (req, res, connection) => Promise.resolve().then(() => {
        req.logger.log('Consumer got messages : ', connection.consumers[req.body.queue]);
        res.status(200).json(connection.consumers[req.body.queue] || {});
      }),
      queues: (req, res, connection) => Promise.resolve().then(() => {
        req.logger.log('Queues to consume : ', Object.keys(connection.consumers));
        res.status(200).json(Object.keys(connection.consumers));
      }),
    };
  }

  connect(req, res, session, connection) {
    req.logger.log(`RabbitService.connect() : req.body = ${JSON.stringify(req.body)}, session = ${session}`);
    let dburl = '';
    const {
      user, password, port, host,
    } = connection.config;
    if (user && password && port) {
      dburl = `amqp://${user}:${password}@${host}:${port}`;
    } else if (port) {
      dburl = `amqp://${host}:${port}`;
    } else {
      dburl = `amqp://${host}`;
    }
    const superClass = this;
    const openAmpq = this.rabbitClient.connect(dburl);
    return openAmpq.then(conn => conn.createChannel()).then((db) => {
      Object.assign(connection, {
        connected: true, db, dburl, consumers: {}, lastUsed: new Date(),
      });
      const jsonResponse = superClass.createConnectedOKRespose(connection);
      res.json(jsonResponse);
      return jsonResponse;
    });
  }

  request(req, res, connection) {
    req.logger.log(`RabbitService.request() : req.body = ${JSON.stringify(req.body)}`);
    if (connection && connection.db && connection.connected) {
      if (this.handlers[req.body.operation]) {
        return this.handlers[req.body.operation](req, res, connection);
      }
      return new Promise(() => res.status(400).send('Wrong request'));
    } throw new Error('No connection to RabbitMQ established');
  }

  disconnect(connection) {
    if (connection.db && connection.connected) {
      connection.db.close();
      connection.connected = false;
      connection.lastUsed = new Date();
    }
  }

  tables(connection, req) {
    req.logger.log(`RabbitService.tables() : dataSource = ${connection.name}`);
    if (connection.connected) {
      req.logger.log('Queues to consume : ', Object.keys(connection.consumers));
      return Promise.resolve().then(() => Object.keys(connection.consumers));
    } throw new Error('No connection to RabbitMQ established');
  }

  schemas() {
    throw new Error('Not implemented');
  }
}

module.exports = RabbitService;
