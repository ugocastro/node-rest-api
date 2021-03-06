'use strict';

const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const RoleModel = require('./role.model');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'role'
  }]
});

userSchema.plugin(idValidator);

/**
* User schema.
* @module
*/
module.exports = mongoose.model('user', userSchema);
