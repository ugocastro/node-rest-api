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

/**
* Role schema.
* @module
*/
module.exports = mongoose.model('role', roleSchema);
