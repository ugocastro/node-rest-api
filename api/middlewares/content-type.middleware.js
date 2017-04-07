'use strict';

const config = require('../../config');

/**
* Validates request's header Content-Type.
* @function
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @param {object} next - Middleware function to be called.
* @returns {object}   - It should call the next middleware, but it can also returns
*                       400 if Content-Type is invalid.
*/
module.exports = (req, res, next) => {
  if (req.headers['content-type'] !== config.contentType) {
    return res.status(400)
      .json({ error: `Invalid content-type. Use '${config.contentType}'` });
  }
  return next();
};
