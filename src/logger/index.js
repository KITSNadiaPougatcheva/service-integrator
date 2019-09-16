'use strict';

const uuidv1 = require('uuid/v1');
const _ = require('lodash');

const logger = {
  getDate: function getDate() { return new Date(); },
  log: function log(...rest) {
    console.log(this.getDate(), ...rest);
  },
  error: function error(...msg) {
    console.error(this.getDate(), ...msg);
  },
  requestId: 'GLOBAL',
};
const useLogger = () => (req, res, next) => {
  const requestId = uuidv1();
  req.logger = Object.assign({}, logger, { requestId });
  req.logger.log = (...rest) => {
    const params = _.reduce(rest, (arr, msg) => {
      let transformedMsg = msg;
      if (Object.prototype.toString.call(msg) === '[object Object]' && msg.password) {
        transformedMsg = Object.assign({}, msg, { password: '***' });
      }
      arr.push(transformedMsg);
      return arr;
    }, []);
    console.log(requestId, logger.getDate(), ...params);
  };
  next();
};

const initLogger = (params) => {
  logger.params = params;
  logger.log('logger initialised OK');
  return logger;
};

module.exports = { logger, initLogger, useLogger };
