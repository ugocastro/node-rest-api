'use strict';

const authController = require('../controllers/auth.controller');

module.exports = app => {
  app.route('/authenticate')
    .post(authController.authenticate);
};
