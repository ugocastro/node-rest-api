'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const UserModel = require('../models/user.model');

/**
* Get username and password to check authentication.
* @function
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object} A HTTP status 200 response with a token.
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
