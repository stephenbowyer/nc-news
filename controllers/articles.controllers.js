const {selectArticle, selectAllArticles} = require('../models/articles.models.js');

function getArticle(request, response, next){
    selectArticle(request.params.article_id).then((article) => {
        response.status(200).send({article});
    }).catch((err) => {
        next(err);
    });
}

function getArticles(request, response, next){
    selectAllArticles().then((articles) => {
        response.status(200).send({articles});
    }).catch((err) => {
        next(err);
    });
}

module.exports = {getArticle, getArticles};