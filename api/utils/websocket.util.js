'use strict';

const io = require('../../server').io;

/**
* Emits an event to connected clients.
* @function emit
* @param {object} event - Event {object} to be sent to connected clients.
* @returns {Promise}    - It returns a {Promise} that emits an event.
*/
exports.emit = event => {
  return Promise.resolve(io.emit('auditing:event', event));
};
