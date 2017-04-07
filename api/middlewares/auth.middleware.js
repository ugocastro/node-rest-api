'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../config');
const RoleModel = require('../models/role.model');
const UserModel = require('../models/user.model');
const standardRoleAuthorizedRoutes = ['/super-heroes', '/super-powers', '/help-me'];

/**
* Authenticates and authorizes an user given a token is sent on request's header.
* @function
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @param {object} next - Middleware function to be called.
* @returns {object}   - It should call the next middleware, but it can also returns
*                       401 if token is (invalid / there is no token) or 403 user does not have
*                       permission to access a route.
*/
module.exports = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (token) {
    return jwt.verify(token, config.secret, (err, decodedInfo) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid access token' });
      }
      return UserModel.findOne({ username: decodedInfo._doc.username })
        .then(user => {
          if (user) {
            req.username = decodedInfo._doc.username;
            return RoleModel.find({ _id: { $in: decodedInfo._doc.roles }})
              .then(roles => {
                const names = roles.map(role => role.name);
                if (!names.find(name => name === 'Admin')) {
                  if (!names.find(name => name === 'Standard')) {
                    return res.status(403)
                      .json({ error: 'User does not have permission to access this route' });
                  }
                  if (!(req.method === 'GET'
                    && standardRoleAuthorizedRoutes.find(route => req.originalUrl.includes(route)))) {
                    return res.status(403)
                      .json({ error: 'User does not have permission to access this route' });
                  }
                }
                return next();
              });
          }
          return res.status(401).json({ error: 'Invalid access token' });
        });
    });
  }
  return res.status(401).json({ error: 'User is not authenticated' });
};
