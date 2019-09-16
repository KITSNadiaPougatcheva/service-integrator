'use strict';

const assert = require('assert');
const sinon = require('sinon');

const redis = require('redis');
const RedisService = require('../../src/services/redis-service');

describe('redis service connect ', () => {
  const redisStub = sinon.stub(redis, 'createClient');

  const req = { logger: console };
  const res = {
    json: (...rest) => { console.log(...rest); },
    status: () => ({ send: () => {} }),
  };
  const session = {};
  const connection = {
    config: {
      user: 'testuser', host: 'somehost', port: '27017', dbname: 'testdb',
    },
  };
  const connectionWrong = {
    config: {
      user: 'testuser', host: 'wronghost', port: '27017', dbname: 'testdb',
    },
  };


  const resOKSpy = sinon.spy(res, 'json');
  const resStatusSpy = sinon.spy(res, 'status');

  beforeEach(async () => {
    const clientResult = {
      conn: 'ok',
      on(event, callback) {
        if (event === 'connect') {
          this.connected = true;
          callback(event);
        }
      },
      quit() {},
    };
    const clientError = {
      conn: 'error',
      on(event, callback) {
        if (event === 'error') {
          callback(event);
        }
      },
      quit() {},
    };

    redisStub.withArgs({
      host: 'somehost', port: '27017', no_ready_check: true, db: 'testdb',
    })
      .returns(clientResult);
    redisStub.withArgs({
      host: 'wronghost', port: '27017', no_ready_check: true, db: 'testdb',
    })
      .returns(clientError);
  });

  afterEach(() => {
  });

  it('should connect OK', (done) => {
    const redisService = new RedisService();
    redisService.connect(req, res, session, connection)
      .then((resultConnection) => {
        assert.equal(resOKSpy.callCount, 1);
        assert.equal(resultConnection.connected, true);
        done();
      });
  });
  it('should connect Fail', (done) => {
    const redisService = new RedisService();
    redisService.connect(req, res, session, connectionWrong)
      .then((resultConnection) => {
        assert(resStatusSpy.calledWith(400));
        assert.equal(resultConnection.connected, false);
        done();
      });
  });
});
