'use strict';

const SuperPowerModel = require('../models/super-power.model');

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
