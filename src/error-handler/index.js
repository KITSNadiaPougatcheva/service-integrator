'use strict';

module.exports = () => (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }
  console.error('ERROR Handler err = ', err);
  res.status(500).send(`error handler : ${err} !!!`);
};
