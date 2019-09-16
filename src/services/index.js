'use strict';

// routes.js

const MongoService = require('./mongo-service');
const PostgreService = require('./postgre-service');
const RedisService = require('./redis-service');
const RabbitService = require('./rabbitmq-service');
const MysqlService = require('./mysql-service');

const services = {
  mongo: new MongoService(),
  postgre: new PostgreService(),
  redis: new RedisService(),
  rabbitmq: new RabbitService(),
  mysql: new MysqlService(),
};
const connections = [];

module.exports = { services, connections };
