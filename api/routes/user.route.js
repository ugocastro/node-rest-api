'use strict';

const userController = require('../controllers/user.controller');

module.exports = app => {
  app.route('/users')
    .get(userController.list)
    .post(userController.create);
};
