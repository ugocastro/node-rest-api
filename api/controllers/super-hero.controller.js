'use strict';

const ObjectId = require('mongoose').Types.ObjectId;
const config = require('../../config');
const SuperHeroModel = require('../models/super-hero.model');
const AuditEventModel = require('../models/audit-event.model');

/**
* Obtains a single super hero by it's identifier.
* @function findOne
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 200 response {object} with a super hero
*                       {object}, but it can also returns 404 if super hero is not found.
*/
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
    .catch(() => res.status(500).json({ error: 'An unexpected error occurred' }));
};

/**
* Obtains a list of super heroes. A search query can be used to paginate results
* (page and limit are {int} params).
* @function list
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 200 response {object} with an {Array} of
*                       super heroes or an empty {Array} if no result is found.
*/
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
    .catch(() => res.status(500).json({ error: 'An unexpected error occurred' }));
};

/**
* Creates a super hero and includes an audit event on database.
* @function create
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 201 response {object} with resource's location
*                       on header, but it can also returns 400 if body params are invalid/required or
*                       422 if super hero already exists.
*/
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
      return new AuditEventModel({ entity: 'SuperHero', entityId: superHero._id.toString(),
        datetime: new Date(), username: req.username, action: 'CREATE' })
    })
    .then(auditEvent => auditEvent.save())
    .then(() => res.sendStatus(201))
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
      return res.status(500).json({ error: 'An unexpected error occurred' });
    });
};

/**
* Updates a super hero and includes an audit event on database.
* @function update
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 204 response {object}, but it can also returns
*                       400 if body params are invalid, 404 if super hero does not exist or
*                       422 if super hero is duplicated.
*/
exports.update = (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Super hero not found' });
  }

  const body = req.body;
  if (body._id) {
    return res.status(400).json({ error: 'Id must not be sent on update' });
  }

  SuperHeroModel.findOne({ _id: id })
    .then(superHero => {
      if (!superHero) {
        return res.status(404).json({ error: 'Super hero not found' });
      }
      Object.assign(superHero, body);
      return superHero.save()
        .then(superHero => {
          return new AuditEventModel({ entity: 'SuperHero', entityId: id,
            datetime: new Date(), username: req.username, action: 'UPDATE' });
        })
        .then(auditEvent => auditEvent.save())
        .then(() => res.sendStatus(204));
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
      return res.status(500).json({ error: 'An unexpected error occurred' });
    });
};

/**
* Removes a super hero and includes an audit event on database.
* @function delete
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 204 response {object}, but it can also returns
*                       404 if super hero does not exist.
*/
exports.delete = (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Super hero not found' });
  }

  SuperHeroModel.findOne({ _id: id })
    .then(superHero => {
      if (!superHero) {
        return res.status(404).json({ error: 'Super hero not found' });
      }
      return superHero.remove()
        .then(() => new AuditEventModel({ entity: 'SuperHero', entityId: id,
          datetime: new Date(), username: req.username, action: 'DELETE' }))
        .then(auditEvent => auditEvent.save())
        .then(() => res.sendStatus(204));
  })
  .catch(() => res.status(500).json({ error: 'An unexpected error occurred' }));
};
