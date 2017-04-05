'use strict';

const fs = require('fs');
const express = require('express');
const expressValidator = require('express-validator');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');

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

app.use((req, res, next) => {
  if (req.headers['content-type'] !== config.contentType) {
    return res.status(400)
      .json({ error: `Invalid content-type. Use '${config.contentType}'` });
  }
  return next();
})

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
fs.readdirSync(routesPath).forEach(fileName => {
  const route = require(routesPath + fileName);
  route(app);
})

app.use((req, res) => {
  return res.status(404).json({ error: `${req.method} '${req.originalUrl}' not found` });
});

app.listen(config.port, err => {
  if (err) {
    return console.log(`Error starting REST API server: ${err}`)
  }
  console.log('REST API server started on: '
    + `${config.protocol}://${config.host}:${config.port}`);
});

module.exports = app;
