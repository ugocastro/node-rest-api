'use strict';

const ObjectId = require('mongoose').Types.ObjectId;
const SuperPowerModel = require('../models/super-power.model');

exports.findOne = (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Super power not found' });
  }

  SuperPowerModel.findOne({ _id: id })
    .exec()
    .then(superPower => {
      if (superPower) {
        return res.json(superPower);
      }
      return res.status(404).json({ error: 'Super power not found' });
    })
    .catch((err) => res.status(500).json(err));
};

exports.list = (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  SuperPowerModel.find({})
    .skip(skip)
    .limit(parseInt(limit, 10))
    .exec()
    .then(superPowers => res.json(superPowers))
    .catch((err) => res.status(500).json(err));
};
