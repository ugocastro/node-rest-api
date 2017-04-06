'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../config');
const RoleModel = require('../models/role.model');
const standardRoleAuthorizedRoutes = ['/super-heroes', '/super-powers', '/help-me'];

module.exports = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (token) {
    return jwt.verify(token, config.secret, (err, decodedInfo) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid access token' });
      }
      req.username = decodedInfo._doc.username;
      return RoleModel.find({ _id: { $in: decodedInfo._doc.roles }})
        .then(roles => {
          const names = roles.map(role => role.name);
          if(!names.find(name => name === 'Admin')) {
            if (!(req.method === 'GET'
              && standardRoleAuthorizedRoutes.find(route => req.originalUrl.includes(route)))) {
              return res.status(403)
                .json({ error: 'User does not have permission to access this route' });
            }
          }
          return next();
        });
    });
  }
  return res.status(401).json({ error: 'User is not authenticated' });
};
