'use strict';

process.env.SECRET = '1111111';
process.env.PORT = 3000;
process.env.DB_USER_PATH = '../../test/test_config.json';
process.env.SESION_TIMEOUT = 900000;

const chaiHttp = require('chai-http');
const chai = require('chai');
const createApp = require('../../src/server.js');

const { expect } = chai;
chai.should();

describe('Auth ', () => {
  const app = createApp();
  chai.use(chaiHttp);

  it('authentication OK', (done) => {
    const data = {
      username: 'myTestUser',
      password: '12345',
    };
    chai.request(app)
      .post('/auth')
      .send(data)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('username').eql('myTestUser');
        res.body.should.have.property('token');

        expect(res).to.have.cookie('session');
        expect(res).to.have.cookie('connect.SI');
        done();
      });
  });

  it('authentication FAIL', (done) => {
    const data = {
      username: 'myTestUser',
      password: '00000',
    };
    chai.request(app)
      .post('/auth')
      .send(data)
      .then((res) => {
        res.should.have.status(401);
        expect(res).to.have.cookie('session');
        expect(res).to.have.cookie('connect.SI');
        done();
      });
  });

  it('authentication FAIL 2', (done) => {
    const data = {
      username: 'admin',
      password: '00000',
    };
    chai.request(app)
      .post('/auth')
      .send(data)
      .then((res) => {
        res.should.have.status(401);
        expect(res).to.have.cookie('session');
        expect(res).to.have.cookie('connect.SI');
        done();
      });
  });


});