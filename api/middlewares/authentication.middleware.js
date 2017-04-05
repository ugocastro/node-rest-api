'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (token) {
    return jwt.verify(token, config.secret, err => {
      if (err) {
        return res.status(401).json({ error: 'Invalid access token' });
      }
      return next();
    });
  }
  return res.status(401).json({ error: 'User is not authenticated' });
};
