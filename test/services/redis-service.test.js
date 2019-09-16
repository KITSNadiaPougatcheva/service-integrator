'use strict';

const assert = require('assert');
const _ = require('lodash');
const sinon = require('sinon');

const RedisService = require('../../src/services/redis-service');
const redis = require('redis');

describe('redis service connect ', () => {

    //const dburlOK = 'amqp://testuser:1q2w3e4r5t@somehost:27017';
    //const dburlWrong = 'amqp://testuser:123@somehost:27017'
    const redisStub = sinon.stub(redis, 'createClient');

    //const redisConnectStub = sinon.stub();
    
    const req = {logger: console};
    const res = {
        json: (...rest) => { console.log(...rest)}, 
        status: () => {return {send: ()=>{}}}
    };
    const session = {};
    const connection = {config: {user:'testuser', host:'somehost',port:'27017',dbname:'testdb'}};
    const connectionWrong = {config: {user:'testuser', host:'wronghost',port:'27017',dbname:'testdb'}};

 
    const resOKSpy = sinon.spy(res, 'json');
    const resStatusSpy = sinon.spy(res, 'status');

    beforeEach(async () => {
 
        const clientResult = {
            conn: 'ok',
            on: function(event, callback) {
                if (event === 'connect') {
                    this.connected = true;
                    callback(event);
                }
            },
            quit: function() {}
        };
        const clientError = {
            conn: 'error',
            on: function(event, callback) {
                if (event === 'error') {
                    callback(event);
                }
            },
            quit: function() {}
        };

        redisStub.withArgs({host:'somehost',port:'27017',no_ready_check:true,db:'testdb'})
        .returns(clientResult);
        redisStub.withArgs({host:'wronghost',port:'27017',no_ready_check:true,db:'testdb'})
        .returns(clientError);
      });
    
      afterEach(() => {
       // redisConnectStub.resetBehavior();
      });

    it('should connect OK', (done) => {
        const redisService = new RedisService();
        redisService.connect(req, res, session, connection)
        .then((resultConnection) => {
            assert.equal(resOKSpy.callCount, 1);
            assert.equal(resultConnection.connected, true);
            done();
        })
        ;
    });
    it('should connect Fail', (done) => {
        const redisService = new RedisService();
        redisService.connect(req, res, session, connectionWrong)
        .then((resultConnection) => {
            assert(resStatusSpy.calledWith(400))
            assert.equal(resultConnection.connected, false);
            done();
        });
    });
});
