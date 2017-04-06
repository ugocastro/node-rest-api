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
  if (!body.username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  if (!body.password) {
    return res.status(400).json({ error: 'Password is required' });
  }

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
        `${config.protocol}://${config.host}:${config.port}/users/${user._id}`);
      return res.sendStatus(201);
    })
    .catch(err => {
      if (err.message && err.message.includes('duplicate key error')) {
        return res.status(422).json({ error: 'Duplicated user' });
      }
      if (err.errors && err.errors.roles) {
        if (err.errors.roles.name === 'CastError') {
          return res.status(400).json({ error: 'Invalid role id' });
        }
        if (err.errors.roles.name === 'ValidatorError') {
          return res.status(400).json({ error: 'Role does not exist' });
        }
      }
      return res.status(500).json(err);
    });
};
