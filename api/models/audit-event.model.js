'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auditEventSchema = new Schema ({
  entity: {
    type: String,
    required: true
  },
  entityId: {
    type: String,
    required: true
  },
  datetime: {
    type: Date,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  }
});

/**
* Audit event schema.
* @module
*/
module.exports = mongoose.model('auditEvent', auditEventSchema);
