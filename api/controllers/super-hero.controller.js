'use strict';

const SuperHeroModel = require('../models/super-hero.model');

exports.list = (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  SuperHeroModel.find({})
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate('protectionArea')
    .exec()
    .then(superHeroes => res.json(superHeroes))
    .catch((err) => res.status(500).json(err));
};
