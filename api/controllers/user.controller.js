'use strict';

const bcrypt = require('bcrypt');
const ObjectId = require('mongoose').Types.ObjectId;
const config = require('../../config');
const UserModel = require('../models/user.model');
const AuditEventModel = require('../models/audit-event.model');

/**
* Obtains a list of users. A search query can be used to paginate results
* (page and limit are {int} params).
* @function list
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 200 response {object} with an {Array} of
*                       users or an empty {Array} if no result is found.
*/
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
    .catch(() => res.status(500).json({ error: 'An unexpected error occurred' }));
};

/**
* Creates an user and includes an audit event on database.
* @function create
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 201 response {object} with resource's location
*                       on header, but it can also returns 400 if body params are invalid/required or
*                       422 if user already exists.
*/
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
      return new AuditEventModel({ entity: 'User', entityId: user._id.toString(),
        datetime: new Date(), username: req.username, action: 'CREATE' });
    })
    .then(auditEvent => auditEvent.save())
    .then(() => res.sendStatus(201))
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
      return res.status(500).json({ error: 'An unexpected error occurred' });
    });
};

/**
* Updates an user and includes an audit event on database.
* @function update
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 204 response {object}, but it can also returns
*                       400 if body params are invalid, 404 if user does not exist or
*                       422 if user is duplicated.
*/
exports.update = (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const body = req.body;
  if (body._id) {
    return res.status(400).json({ error: 'Id must not be sent on update' });
  }

  UserModel.findOne({ _id: id })
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return Promise.resolve(Object.assign(user, body))
        .then(user => {
          if (body.password) {
            return Promise.all([user, bcrypt.hash(user.password, config.saltRounds)])
              .then(results => {
                const [user, hash] = results;
                user.password = hash;
                return user.save();
              });
          }
          return user.save();
        })
        .then(user => {
          return new AuditEventModel({ entity: 'User', entityId: id,
            datetime: new Date(), username: req.username, action: 'UPDATE' });
        })
        .then(auditEvent => auditEvent.save())
        .then(() => res.sendStatus(204));
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
      return res.status(500).json({ error: 'An unexpected error occurred' });
    });
};

/**
* Removes an user and includes an audit event on database.
* @function delete
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 204 response {object}, but it can also returns
*                       404 if suser does not exist.
*/
exports.delete = (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'User not found' });
  }

  UserModel.findOne({ _id: id })
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return user.remove()
        .then(() => new AuditEventModel({ entity: 'User', entityId: id,
          datetime: new Date(), username: req.username, action: 'DELETE' }))
        .then(auditEvent => auditEvent.save())
        .then(() => res.sendStatus(204));
  })
  .catch(() => res.status(500).json({ error: 'An unexpected error occurred' }));
};
