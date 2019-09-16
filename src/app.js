'use strict';

// for debug mode :
// start node --inspect app.js

const createApp = require('./server');
const { port } = require('./user-session');

Promise
  .resolve(createApp())
  .then(app => app
    .listen(port, err => (err
      ? console.error(err)
      : console.log(`listening on ${port}`))))
  .catch(console.error);
