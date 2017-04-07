'use strict';

const authController = require('../controllers/auth.controller');

/**
* Configures authentication's routes.
* @module
*/
module.exports = app => {
  app.route('/authenticate')
    .post(authController.authenticate);
};
