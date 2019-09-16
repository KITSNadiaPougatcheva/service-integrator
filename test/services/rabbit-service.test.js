'use strict';

const assert = require('assert');
const _ = require('lodash');
const sinon = require('sinon');

const RabbitService = require('../../src/services/rabbitmq-service');

describe('rabbit service connect ', () => {

    const dburlOK = 'amqp://testuser:1q2w3e4r5t@somehost:27017';
    const dburlWrong = 'amqp://testuser:123@somehost:27017'

    const rabbitConnectStub = sinon.stub();
    const rabbitClient = { 
        connect: rabbitConnectStub,
        testConnection: true,
    };
    
    const req = {logger: console};
    const res = {json: (...rest) => { console.log(...rest)}, };
    const session = {};
    const connection = {config: {user:'testuser', password:'1q2w3e4r5t',host:'somehost',port:'27017'}};
    const connectionWrong = {config: {user:'testuser', password:'123',host:'somehost',port:'27017'}};

    const connResult = {
        createChannel: function() {
            return {testConnection: true};
        }
    };

    const resSpy = sinon.spy(res, 'json');

    beforeEach(async () => {
        rabbitConnectStub.withArgs(dburlOK).returns(new Promise((resolve, reject) => {
            resolve(connResult);
        })
        );
        rabbitConnectStub.withArgs(dburlWrong).returns(new Promise((resolve, reject) => {
            reject({err: 'TEST ERROR'});
        })

        );
      });
    
      afterEach(() => {
        rabbitConnectStub.resetBehavior();
      });

    it('should connect OK', (done) => {
        const rabbit = new RabbitService();
        rabbit.rabbitClient = rabbitClient;
        rabbit.connect(req, res, session, connection)
        .then((resultConnection) => {
            assert.equal(resSpy.callCount, 1);
            assert.deepEqual(resultConnection, {connected:true, user:'testuser', host:'somehost',port:'27017'})
            done();
        })
        ;
    });
    it('should connect Fail', (done) => {
        const rabbit = new RabbitService();
        rabbit.rabbitClient = rabbitClient;
        rabbit.connect(req, res, session, connectionWrong)
        .then(() => {
            assert.fail();
        })
        .catch((err) => {
            assert.deepEqual(err, {err:'TEST ERROR'});
            done();
        });
    });
});
