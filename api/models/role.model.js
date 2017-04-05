'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema ({
  name: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = mongoose.model('role', roleSchema);
