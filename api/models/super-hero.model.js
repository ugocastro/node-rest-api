'use strict';

const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const ProtectionArea = require('./protection-area.model');
const SuperPowerModel = require('./super-power.model');
const Schema = mongoose.Schema;

const superHeroSchema = new Schema ({
  name: {
    type: String,
    unique: true,
    required: true
  },
  alias: {
    type: String,
    required: true
  },
  protectionArea: {
    type: Schema.Types.ObjectId,
    ref: 'protectionArea',
    required: true
  },
  superPowers: [{
    type: Schema.Types.ObjectId,
    ref: 'superPower'
  }]
});

superHeroSchema.set('collection', 'superheroes');
superHeroSchema.plugin(idValidator);

/**
* Super hero schema.
* @module
*/
module.exports = mongoose.model('superHero', superHeroSchema);
