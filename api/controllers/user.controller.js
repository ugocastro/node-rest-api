'use strict';

const bcrypt = require('bcrypt');
const config = require('../../config');
const UserModel = require('../models/user.model');

exports.list = (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  UserModel.find({})
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate('roles')
    .exec()
    .then(users => res.json(users.map(user => {
      const $user = user;
      $user.password = undefined;
      return $user;
    })))
    .catch((err) => res.status(500).json(err));
};

exports.create = (req, res) => {
  const body = req.body;
  Promise.resolve()
    .then(() => new UserModel(body))
    .then(user =>
      Promise.all([user, bcrypt.hash(user.password, config.saltRounds)]))
    .then(results => {
      const [user, hash] = results;
      user.password = hash;
      return user.save();
    })
    .then(user => {
      res.setHeader('Location',
        `${config.protocol}://${config.host}:${config.port}/${user._id}`);
      return res.sendStatus(201);
    })
    .catch(err => res.sendStatus(500).json(err));
};
