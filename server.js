'use strict';

const fs = require('fs');
const express = require('express');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');
const authRoute = require('./api/routes/auth.route');
const checkAuthentication = require('./api/middlewares/authentication.middleware');
const checkContentType = require('./api/middlewares/content-type.middleware');
const notFound = require('./api/middlewares/not-found.middleware');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${config.host}/${config.database}`, err => {
  if (err) {
    return console.log(`Error connecting with MongoDB: ${err}`)
  }
  console.log('MongoDB connected');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(expressValidator());
app.use(checkContentType);

authRoute(app);

app.use(checkAuthentication);

app.use((req, res, next) => {
  req.checkQuery('page', "Must be an integer with '1' as min value")
    .optional().isInt({ min: 1 });
  req.checkQuery('limit', "Must be an integer with '1' as min value")
    .optional().isInt({ min: 1 });

  req.getValidationResult()
    .then(errors => {
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return next();
    });
});

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
    return console.log(`Error starting REST API server: ${err}`)
  }
  console.log('REST API server started on: '
    + `${config.protocol}://${config.host}:${config.port}`);
});

module.exports = app;
