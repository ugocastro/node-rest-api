'use strict';

const env = process.env.NODE_ENV || 'development';
const protocol = process.env.PROTOCOL || 'http';
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;
const database = `super-heroes-${env}`;
const contentType = process.env.CONTENT_TYPE || 'application/json';
const saltRounds = process.env.SALT_ROUNDS || 10;
const secret = process.env.secret || '7Super.4Heroes-2Catalog!';

/**
* Exports all configuration used on API.
* @module
*/
module.exports = {
  protocol,
  host,
  port,
  database,
  contentType,
  saltRounds,
  secret
};
