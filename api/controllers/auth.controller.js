'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const UserModel = require('../models/user.model');

/**
* Obtains username and password to check authentication.
* @function authenticate
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 200 response {object} with a {String} token,
*                       but it can also returns 404 if user not found or 401 for invalid credentials.
*/
exports.authenticate = (req, res) => {
  UserModel.findOne({ username: req.body.username })
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return bcrypt.compare(req.body.password, user.password)
        .then(passwordChecked => {
          if (passwordChecked) {
            return res.json({ token: jwt.sign(user, config.secret) });
          }
          return res.status(401).json({ error: 'Invalid username/password' });
        });
    })
    .catch(() => res.status(500).json({ error: 'An unexpected error occurred' }));
};
