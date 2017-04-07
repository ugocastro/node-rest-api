'use strict';

const fs = require('fs');
const express = require('express');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
const config = require('./config');
const authRoute = require('./api/routes/auth.route');
const checkAuth = require('./api/middlewares/auth.middleware');
const checkContentType = require('./api/middlewares/content-type.middleware');
const checkQueryParams = require('./api/middlewares/query-param.middleware');
const notFound = require('./api/middlewares/not-found.middleware');

const app = express();
const server = http.createServer(app);
const io = socketIO.listen(server);

/**
* Exports io (to emit events to connected clients).
* @module
*/
exports.io = io;

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${config.host}/${config.database}`, err => {
  if (err) {
    return console.log(`Error connecting with MongoDB: ${err}`);
  }
  console.log('MongoDB connected');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator({
  customValidators: {
    isFloat: (value) => Number.parseFloat(value)
  }
}));
app.use(checkContentType);

authRoute(app);

app.use(checkAuth);
app.use(checkQueryParams);

const routesPath = './api/routes/';
fs.readdirSync(routesPath).forEach(filename => {
  if (filename !== 'auth.route.js') {
    const route = require(routesPath + filename);
    route(app);
  }
});

app.use(notFound);

app.listen(config.port, err => {
  if (err) {
    return console.log(`Error starting REST API server: ${err}`);
  }
  console.log('REST API server started on: '
    + `${config.protocol}://${config.host}:${config.port}`);
});

/**
* Exports application (to be used on tests, for example).
* @module
*/
exports.app = app;
