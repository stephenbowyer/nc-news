const {selectArticle, selectAllArticles, updateArticleVotes} = require('../models/articles.models.js');

function getArticle(request, response, next){
    selectArticle(request.params.article_id).then((article) => {
        response.status(200).send({article});
    }).catch((err) => {
        next(err);
    });
}

function getArticles(request, response, next){
    selectAllArticles(request.query.topic).then((articles) => {
        response.status(200).send({articles});
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