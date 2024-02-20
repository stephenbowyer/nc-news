const express = require('express');
const app = express();
app.use(express.json());

const {getTopics} = require('./controllers/topics.controllers.js');
const {getApis} = require('./controllers/api.controllers.js');
const {getArticle, getArticles} = require('./controllers/articles.controllers.js');
const {getArticleComments, postArticleComment} = require('./controllers/comments.controllers.js');

app.get('/api/topics', getTopics);
app.get('/api', getApis);
app.get('/api/articles/:article_id', getArticle);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id/comments', getArticleComments);
app.post('/api/articles/:article_id/comments', postArticleComment);


app.use((err,request,response,next) => {
    if (err.status && err.msg)
        response.status(err.status).send({msg: err.msg})

    next(err);
});

app.use((err,request,response,next) => {
    if (err.code === '23503') // PSQL: Key not present in table
        response.status(404).send({msg: "Not Found"})

    if (err.code.startsWith('22P')) // PSQL: Invalid data (various)
        response.status(400).send({msg: "Bad Request"})
});

module.exports = app;
