const {selectArticle, selectAllArticles, updateArticleVotes} = require('../models/articles.models.js');
const {selectTopic} = require('../models/topics.models.js');

function getArticle(request, response, next){
    selectArticle(request.params.article_id).then((article) => {
        response.status(200).send({article});
    }).catch((err) => {
        next(err);
    });
}

function getArticles(request, response, next){
    const promises = [selectAllArticles(request.query.topic)];
    if (request.query.topic){
        promises.push(selectTopic(request.query.topic));
    }
    
    Promise.all(promises).then((promiseResolutions) => {
        response.status(200).send({articles: promiseResolutions[0]});
    }).catch((err) => {
        next(err);
    });
}

function patchArticle(request, response, next){
    updateArticleVotes(request.params.article_id, request.body.inc_votes).then((article) => {
        response.status(200).send({article});
    }).catch((err) => {
        next(err);
    });
}

module.exports = {getArticle, getArticles, patchArticle};