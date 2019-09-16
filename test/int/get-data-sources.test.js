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

  it('get-data-sources no auth FAIL', (done) => {
    chai.request(app)
      .get('/get-data-sources')
      .send()
      .then((res) => {
        expect(res).to.have.status(401);
        done();
      });
  });

});