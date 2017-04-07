'use strict';

const superPowerController = require('../controllers/super-power.controller');

/**
* Configures super powers' routes.
* @module
*/
module.exports = app => {
  app.route('/super-powers')
    .get(superPowerController.list)
    .post(superPowerController.create);

  app.route('/super-powers/:id')
    .get(superPowerController.findOne)
    .put(superPowerController.update)
    .delete(superPowerController.delete);
};
