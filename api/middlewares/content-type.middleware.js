'use strict';

const config = require('../../config');

module.exports = (req, res, next) => {
  if (req.headers['content-type'] !== config.contentType) {
    return res.status(400)
      .json({ error: `Invalid content-type. Use '${config.contentType}'` });
  }
  return next();
};
