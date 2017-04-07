'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const protectionAreaSchema = new Schema ({
  name: {
    type: String,
    unique: true,
    required: true
  },
  location: {
    type: {
      type: String,
      required: true
    },
    coordinates: [{
      type: Number,
      required: true
    }]
  },
  radius: {
    type: Number,
    required: true
  }
});

protectionAreaSchema.index({ 'location': '2dsphere' });

/**
* Protection area schema.
* @module
*/
module.exports = mongoose.model('protectionArea', protectionAreaSchema);
