'use strict';

module.exports = services => (req, res) => {
  try {
    req.logger.log('get-services get');

    const servicesRes = [];
    Object.keys(services).forEach((key) => {
      const {
        frames, script, panel, initialize,
      } = services[key];
      servicesRes.push(
        {
          type: key,
          frames,
          script,
          panel,
          initialize,
        },
      );
      req.logger.log(`${key} = ${services[key]}`);
    });

    const { token, username } = req.userSession;
    const result = {
      services: servicesRes,
      user: {
        token,
        username,
      },
    };
    res.status(200).json(result);
  } catch (err) {
    req.logger.error(err);
    res.sendStatus(500);
  }
};
