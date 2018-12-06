const fs = require('fs');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const _ = require('lodash');
const DDSRouter = require('./dds-router');

// Initialize DB
const DB_PATH = './db/db.json';
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, '{ "routes": {} }');
}
const db = require(DB_PATH);
const ddsRouter = new DDSRouter(db.routes);
const app = express();

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// DDS APIs
app.get('/_dds', (req, res) => res.send(db));

app.put('/_dds', (req, res) => {
  ddsRouter.update(req.body.routes);
  saveDB();
  res.sendStatus(200);
});

app.post('/_dds/api', (req, res) => {
  const { path, method, responses } = req.body;
  // Error
  if (ddsRouter.getResponseConfig(path, method)) {
    return res.status(409).send('Dummy Ducky: API already exists!');
  }

  ddsRouter.addRoute(path, method, responses);
  saveDB();
  res.sendStatus(201);
});

app.delete('/_dds/api', (req, res) => {
  const { path, method } = req.body;
  // Error
  if (!ddsRouter.getResponseConfig(path, method)) {
    return res.status(404).send('Dummy Ducky: API not found!');
  }

  ddsRouter.removeRoute(path, method);
  saveDB();
  res.sendStatus(200);
});

app.put('/_dds/api', (req, res) => {
  const { path, method, responses } = req.body;
  // Error
  if (!ddsRouter.getResponseConfig(path, method)) {
    return res.status(404).send('Dummy Ducky: API not found!');
  }

  ddsRouter.updateRoute(path, method, responses);
  saveDB();
  res.sendStatus(200);
});

app.put('/_dds/api/current', (req, res) => {
  const { path, method, key } = req.body;
  const responseConfig = ddsRouter.getResponseConfig(path, method);
  // Error
  if (!responseConfig) {
    return res.status(404).send('Dummy Ducky: API not found!');
  }
  if (!ddsRouter.getResponse(path, method, key)) {
    return res.status(404).send('Dummy Ducky: API response not found!');
  }

  responseConfig.current = key;
  saveDB();
  res.sendStatus(200);
});

app.put('/_dds/api/disabled', (req, res) => {
  const { path, method, disabled } = req.body;
  const responseConfig = ddsRouter.getResponseConfig(path, method);
  // Error
  if (!responseConfig) {
    return res.status(404).send('Dummy Ducky: API not found!');
  }

  responseConfig.disabled = disabled;
  saveDB();
  res.sendStatus(200);
});

// Dummy APIs
app.all('*', (req, res) => {
  const matchedPath = ddsRouter.getMatchedPath(req);
  const response = ddsRouter.getCurrentResponse(matchedPath, req.method);
  // Error
  if (!response) {
    return res.status(404).send('Dummy Ducky: API not found!');
  }

  res.status(response.status).send(response.body);
});

function saveDB() {
  db.routes = ddsRouter.config;
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

module.exports = app;
