'use strict';

const ProtectionAreaModel = require('../models/protection-area.model');

exports.list = (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  ProtectionAreaModel.find({})
    .skip(skip)
    .limit(parseInt(limit, 10))
    .exec()
    .then(areas => res.json(areas))
    .catch((err) => res.status(500).json(err));
};
