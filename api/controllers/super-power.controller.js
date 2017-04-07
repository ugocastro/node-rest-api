'use strict';

const ObjectId = require('mongoose').Types.ObjectId;
const config = require('../../config');
const websocketUtil = require('../utils/websocket.util');
const SuperPowerModel = require('../models/super-power.model');
const SuperHeroModel = require('../models/super-hero.model');
const AuditEventModel = require('../models/audit-event.model');

/**
* Obtains a single super power by it's identifier.
* @function findOne
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 200 response {object} with a super power
*                       {object}, but it can also returns 404 if super power is not found.
*/
exports.findOne = (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Super power not found' });
  }

  SuperPowerModel.findOne({ _id: id })
    .then(superPower => {
      if (superPower) {
        return res.json(superPower);
      }
      return res.status(404).json({ error: 'Super power not found' });
    })
    .catch(() => res.status(500).json({ error: 'An unexpected error occurred' }));
};

/**
* Obtains a list of super powers. A search query can be used to paginate results
* (page and limit are {int} params).
* @function list
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 200 response {object} with an {Array} of
*                       super powers or an empty {Array} if no result is found.
*/
exports.list = (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  SuperPowerModel.find({})
    .skip(skip)
    .limit(parseInt(limit, 10))
    .exec()
    .then(superPowers => res.json(superPowers))
    .catch(() => res.status(500).json({ error: 'An unexpected error occurred' }));
};

/**
* Creates a super power, includes an audit event on database and emits that event to connected clients.
* @function create
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 201 response {object} with resource's location
*                       on header, but it can also returns 400 if body params are invalid/required or
*                       422 if super power already exists.
*/
exports.create = (req, res) => {
  const body = req.body;
  if (!body.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  Promise.resolve()
    .then(() => new SuperPowerModel(body))
    .then(superPower => superPower.save())
    .then(superPower => {
      res.setHeader('Location',
        `${config.protocol}://${config.host}:${config.port}/super-powers/${superPower._id}`);
      return new AuditEventModel({ entity: 'SuperPower', entityId: superPower._id.toString(),
        datetime: new Date(), username: req.username, action: 'CREATE' });
    })
    .then(auditEvent => auditEvent.save())
    .then(auditEvent => websocketUtil.emit(auditEvent))
    .then(() => res.sendStatus(201))
    .catch(err => {
      if (err.message && err.message.includes('duplicate key error')) {
        return res.status(422).json({ error: 'Duplicated super power' });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    });
};

/**
* Updates a super power, includes an audit event on database and emits that event to connected clients.
* @function update
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 204 response {object}, but it can also returns
*                       400 if body params are invalid, 404 if super power does not exist or
*                       422 if super power is duplicated.
*/
exports.update = (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Super power not found' });
  }

  const body = req.body;
  if (body._id) {
    return res.status(400).json({ error: 'Id must not be sent on update' });
  }

  SuperPowerModel.findOne({ _id: id })
    .then(superPower => {
      if (!superPower) {
        return res.status(404).json({ error: 'Super power not found' });
      }
      Object.assign(superPower, body);
      return superPower.save()
        .then(superPower => {
          return new AuditEventModel({ entity: 'SuperPower', entityId: id,
            datetime: new Date(), username: req.username, action: 'UPDATE' });
        })
        .then(auditEvent => auditEvent.save())
        .then(auditEvent => websocketUtil.emit(auditEvent))
        .then(() => res.sendStatus(204));
    })
    .catch(err => {
      if (err.message && err.message.includes('duplicate key error')) {
        return res.status(422).json({ error: 'Duplicated super power' });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    });
};

/**
* Removes a super power, includes an audit event on database and emits that event to connected clients.
* @function delete
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 204 response {object}, but it can also returns
*                       404 if super power does not exist or 422 if super power is associated with a
*                       super hero.
*/
exports.delete = (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Super power not found' });
  }

  SuperPowerModel.findOne({ _id: id })
    .then(superPower => {
      if (!superPower) {
        return res.status(404).json({ error: 'Super power not found' });
      }

      return SuperHeroModel.find({ superPowers: id })
        .then(superHeroes => {
          if (superHeroes.length === 0) {
            return superPower.remove()
              .then(() => new AuditEventModel({ entity: 'SuperPower', entityId: id,
                datetime: new Date(), username: req.username, action: 'DELETE' }))
              .then(auditEvent => auditEvent.save())
              .then(auditEvent => websocketUtil.emit(auditEvent))
              .then(() => res.sendStatus(204));
          }
          return res.status(422).json({ error: 'Super power is associated to a super hero' });
        })
    })
    .catch(() => res.status(500).json({ error: 'An unexpected error occurred' }));
};
