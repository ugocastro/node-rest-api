'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const superPowerSchema = new Schema ({
  name: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('superPower', superPowerSchema);
