'use strict';

const assert = require('assert');
const _ = require('lodash');
const sinon = require('sinon');

const PostgreService = require('../../src/services/postgre-service');

describe('postgre service connect ', () => {
  const dburlOK = {
    user: 'testuser', password: '1q2w3e4r5t', host: 'somehost', port: '27017', database: 'testdb',
  };

  const postgreConnectStub = function postgreStub(url) {
    this.connect = function connect() {
      return new Promise((resolve, reject) => {
        if (_.isEqual(url, dburlOK)) {
          resolve();
        } else {
          reject(new Error('something bad happened'));
        }
      });
    };
    this.testDB = true;
  };

  const req = { logger: console };
  const res = { json: (...rest) => { console.log(...rest); } };
  const session = {};
  const connection = {
    config: {
      user: 'testuser', password: '1q2w3e4r5t', host: 'somehost', port: '27017', dbname: 'testdb',
    },
  };
  const connectionWrong = {
    config: {
      user: 'testuser', password: '123', host: 'somehost', port: '27017', dbname: 'testdb',
    },
  };

  const resSpy = sinon.spy(res, 'json');

  it('should connect OK', (done) => {
    const postgre = new PostgreService();
    postgre.PostgreClient = postgreConnectStub;
    postgre.connect(req, res, session, connection)
      .then((resultConnection) => {
        assert.equal(resSpy.callCount, 1);
        assert.deepEqual(resultConnection, {
          connected: true, user: 'testuser', host: 'somehost', port: '27017', dbname: 'testdb',
        });
        done();
      });
  });
  it('should connect Fail', (done) => {
    const postgre = new PostgreService();
    postgre.PostgreClient = postgreConnectStub;
    postgre.connect(req, res, session, connectionWrong)
      .then(() => {
        assert.fail();
      })
      .catch((err) => {
        assert(err instanceof Error);
        done();
      });
  });
});
