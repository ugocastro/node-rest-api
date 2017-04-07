'use strict';

const helpMeController = require('../controllers/help-me.controller');

/**
* Configures route to help users finding closest super heroes.
* @module
*/
module.exports = app => {
  app.route('/help-me')
    .get(helpMeController.helpMe);
};
