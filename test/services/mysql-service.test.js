'use strict';

const assert = require('assert');
const sinon = require('sinon');
const mysql = require('mysql');

const MysqlService = require('../../src/services/mysql-service');

describe('mysl service connect', () => {
  const dburlOK = {
    user: 'testuser', password: '1q2w3e4r5t', host: 'somehost', database: 'testdb', port: '2222',
  };
  const dburlWrong = {
    user: 'testuser', password: '123', host: 'somehost', database: 'testdb', port: '2222',
  };
  const mysqlConnectStub = sinon.stub(mysql, 'createConnection');

  const req = { logger: console };
  const res = { json: (...rest) => { console.log(...rest); } };
  const session = {};
  const connection = {
    config: {
      user: 'testuser', password: '1q2w3e4r5t', host: 'somehost', dbname: 'testdb', port: '2222',
    },
  };
  const connectionWrong = {
    config: {
      user: 'testuser', password: '123', host: 'somehost', dbname: 'testdb', port: '2222',
    },
  };

  const resSpy = sinon.spy(res, 'json');

  beforeEach(async () => {
    mysqlConnectStub.withArgs(dburlOK).returns({ connect(callback) { callback(); } });
    mysqlConnectStub.withArgs(dburlWrong).returns({ connect(callback) { callback('TEST ERROR'); } });
  });

  afterEach(() => {
    mysqlConnectStub.resetBehavior();
  });

  it('should connect OK', (done) => {
    const mysqlClient = new MysqlService();
    mysqlClient.connect(req, res, session, connection)
      .then((resultConnection) => {
        assert.equal(resSpy.callCount, 1);
        assert.deepEqual(resultConnection, {
          connected: true, user: 'testuser', host: 'somehost', dbname: 'testdb', port: '2222',
        });
        done();
      });
  });

  it('should connect FAIL', (done) => {
    const mysqlClient = new MysqlService();
    mysqlClient.connect(req, res, session, connectionWrong)
      .then(() => {
        assert.fail('FAIL !');
      })
      .catch((err) => {
        assert.equal(err, 'TEST ERROR');
        done();
      });
  });
});
