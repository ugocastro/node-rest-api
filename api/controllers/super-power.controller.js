'use strict';

const ObjectId = require('mongoose').Types.ObjectId;
const config = require('../../config');
const SuperPowerModel = require('../models/super-power.model');
const SuperHeroModel = require('../models/super-hero.model');
const AuditEventModel = require('../models/audit-event.model');

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
    .then(() => res.sendStatus(201))
    .catch(err => {
      if (err.message && err.message.includes('duplicate key error')) {
        return res.status(422).json({ error: 'Duplicated super power' });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    });
};

exports.update = (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Super power not found' });
  }

  const body = req.body;
  if (body._id) {
    return res.status(400).json({ error: 'Id must not be sent on update' });
  }
  if (!body.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  SuperPowerModel.findOne({ _id: id })
    .then(superPower => {
      if (!superPower) {
        return res.status(404).json({ error: 'Super power not found' });
      }
      Object.assign(superPower, body);
      return superPower.save()
        .then(superPower => {
          return new AuditEventModel({ entity: 'SuperPower', entityId: superPower._id.toString(),
            datetime: new Date(), username: req.username, action: 'UPDATE' });
        })
        .then(auditEvent => auditEvent.save())
        .then(() => res.sendStatus(204));
    })
    .catch(err => {
      if (err.message && err.message.includes('duplicate key error')) {
        return res.status(422).json({ error: 'Duplicated super power' });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    });
};

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
              .then(() => res.sendStatus(204));
          }
          return res.status(422).json({ error: 'Super power is associated to a super hero' });
        })
    })
    .catch(() => res.status(500).json({ error: 'An unexpected error occurred' }));
};
