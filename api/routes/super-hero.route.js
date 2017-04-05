'use strict';

const superHeroController = require('../controllers/super-hero.controller');

module.exports = app => {
  app.route('/super-heroes')
    .get(superHeroController.list);
};
