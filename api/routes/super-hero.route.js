'use strict';

const superHeroController = require('../controllers/super-hero.controller');

/**
* Configures super heroes' routes.
* @module
*/
module.exports = app => {
  app.route('/super-heroes')
    .get(superHeroController.list)
    .post(superHeroController.create);

  app.route('/super-heroes/:id')
    .get(superHeroController.findOne)
    .put(superHeroController.update)
    .delete(superHeroController.delete);
};
