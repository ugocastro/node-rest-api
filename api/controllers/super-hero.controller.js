'use strict';

const ObjectId = require('mongoose').Types.ObjectId;
const config = require('../../config');
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

exports.create = (req, res) => {
  const body = req.body;
  if (!body.name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!body.alias) {
    return res.status(400).json({ error: 'Alias is required' });
  }
  if (!body.protectionArea) {
    return res.status(400).json({ error: 'Protection area is required' });
  }

  Promise.resolve()
    .then(() => new SuperHeroModel(body))
    .then(superHero => superHero.save())
    .then(superHero => {
      res.setHeader('Location',
        `${config.protocol}://${config.host}:${config.port}/super-heroes/${superHero._id}`);
      return res.sendStatus(201);
    })
    .catch(err => {
      if (err.message && err.message.includes('duplicate key error')) {
        return res.status(422).json({ error: 'Duplicated super hero' });
      }
      if (err.errors) {
        if ((err.errors.protectionArea && err.errors.protectionArea.name === 'CastError')
          || (err.errors.superPowers && err.errors.superPowers.name === 'CastError')) {
            return res.status(400)
              .json({ error: 'Invalid (protection area/super power) id' });
          }
        if ((err.errors.protectionArea && err.errors.protectionArea.name === 'ValidatorError')
          || (err.errors.superPowers && err.errors.superPowers.name === 'ValidatorError')) {
            return res.status(400)
              .json({ error: '(Protection area/super power) does not exist' });
          }
      }
      return res.status(500).json(err);
    });
};
