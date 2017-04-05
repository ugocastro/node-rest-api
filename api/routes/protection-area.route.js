'use strict';

const protectionAreaController =
  require('../controllers/protection-area.controller');

module.exports = app => {
  app.route('/protection-areas')
    .get(protectionAreaController.list)
};
