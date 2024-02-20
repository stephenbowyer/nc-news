const {selectArticle} = require("../models/articles.models.js");
const {selectArticleComments} = require("../models/comments.models.js");

function getArticleComments(request, response, next){
    const promises = [selectArticleComments(request.params.article_id)];
    if (request.params.article_id)
        promises.push(selectArticle(request.params.article_id));

    Promise.all(promises).then((promiseResolutions) => {
        response.status(200).send({comments: promiseResolutions[0]});
    }).catch((err) => {
        next(err);
    });
}

module.exports = {getArticleComments};