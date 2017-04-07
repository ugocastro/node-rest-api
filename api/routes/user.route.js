'use strict';

const userController = require('../controllers/user.controller');

/**
* Configures user's routes.
* @module
*/
module.exports = app => {
  app.route('/users')
    .get(userController.list)
    .post(userController.create);

  app.route('/users/:id')
    .put(userController.update)
    .delete(userController.delete);
};
