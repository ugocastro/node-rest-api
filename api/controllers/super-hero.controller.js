'use strict';

const ObjectId = require('mongoose').Types.ObjectId;
const SuperHeroModel = require('../models/super-hero.model');

exports.findOne = (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Super hero not found' });
  }
  SuperHeroModel.findOne({ _id: id })
    .populate('protectionArea')
    .exec()
    .then(superHero => {
      if (superHero) {
        return res.json(superHero);
      }
      return res.status(404).json({ error: 'Super hero not found' });
    })
    .catch((err) => res.status(500).json(err));
};

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
