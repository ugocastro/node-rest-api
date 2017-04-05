'use strict';

const env = process.env.NODE_ENV || 'development';
const protocol = process.env.PROTOCOL || 'http';
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;
const database = `super-heroes-${env}`;
const contentType = process.env.CONTENT_TYPE || 'application/json';

module.exports = {
  protocol,
  host,
  port,
  database,
  contentType
};
