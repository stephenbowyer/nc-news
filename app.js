const express = require('express');
const app = express();

const {getTopics} = require('./controllers/topics.controllers.js');
const {getApis} = require('./controllers/api.controllers.js');

app.get('/api/topics', getTopics);
app.get('/api', getApis);

module.exports = app;
