'use strict';

const superPowerController = require('../controllers/super-power.controller');

module.exports = app => {
  app.route('/super-powers')
    .get(superPowerController.list)
};
