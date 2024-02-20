const express = require('express');
const app = express();

const {getTopics} = require('./controllers/topics.controllers.js');
const {getApis} = require('./controllers/api.controllers.js');
const {getArticle, getArticles} = require('./controllers/articles.controllers.js');

app.get('/api/topics', getTopics);
app.get('/api', getApis);
app.get('/api/articles/:article_id', getArticle);
app.get('/api/articles', getArticles);

app.use((err,request,response,next) => {
    if (err.status && err.msg){
        response.status(err.status).send({msg: err.msg})
    }
});

module.exports = app;
