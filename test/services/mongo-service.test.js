'use strict';

const assert = require('assert');
const sinon = require('sinon');
const mongoClient = require('mongodb').MongoClient;

const MongoService = require('../../src/services/mongo-service');

describe('mongo service connect ', () => {
  const dburlOK = 'mongodb://testuser:1q2w3e4r5t@localhost:27017/testdb';
  const dburlWrong = 'mongodb://testuser:123@localhost:27017/testdb';
  const mongoConnectStub = sinon.stub(mongoClient, 'connect');
  const connResult = { db: dbname => dbname ? 'testdb' : 'err' };

  const req = { logger: console };
  const res = { json: (...rest) => { console.log(...rest); } };
  const session = {};
  const connection = {
    config: {
      user: 'testuser', password: '1q2w3e4r5t', host: 'localhost', port: '27017', dbname: 'testdb',
    },
  };
  const connectionWrong = {
    config: {
      user: 'testuser', password: '123', host: 'localhost', port: '27017', dbname: 'testdb',
    },
  };

  const resSpy = sinon.spy(res, 'json');

  beforeEach(async () => {
  });

  afterEach(() => {
    mongoConnectStub.resetBehavior();
  });
  it('should connect OK', (done) => {
    mongoConnectStub.withArgs(dburlOK).returns(new Promise((resolve) => {
      resolve(connResult);
    }));

    const mongo = new MongoService();
    mongo.connect(req, res, session, connection)
      .then((resultConnection) => {
        assert.equal(resSpy.callCount, 1);
        assert.deepEqual(resultConnection, {
          connected: true, user: 'testuser', host: 'localhost', port: '27017', dbname: 'testdb',
        });
        done();
      });
  });

  it('should connect Fail', (done) => {
    mongoConnectStub.withArgs(dburlWrong).returns(new Promise((resolve, reject) => {
      reject(new Error('something bad happened'));
    }));

    const mongo = new MongoService();
    mongo.connect(req, res, session, connectionWrong)
      .then((_) => {
        assert.fail();
      })
      .catch((err) => {
        assert(err instanceof Error);
        done();
      });
  });
});
