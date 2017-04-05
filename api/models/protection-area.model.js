'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const protectionAreaSchema = new Schema ({
  name: {
    type: String,
    unique: true,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('protectionArea', protectionAreaSchema);
