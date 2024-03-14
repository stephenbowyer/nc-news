const {selectArticle} = require("../models/articles.models.js");
const {selectArticleComments, insertArticleComment, removeComment, updateCommentVotes} = require("../models/comments.models.js");

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

function postArticleComment(request, response, next){
    insertArticleComment(request.params.article_id, request.body).then((comment) => {
        response.status(201).send({comment});
    }).catch((err) => {
        next(err);
    });
}

function deleteComment(request, response, next){
    removeComment(request.params.comment_id).then(() => {
        response.status(204).send();
    }).catch((err) => {
        next(err);
    });
}
function patchComment(request, response, next){
    updateCommentVotes(request.params.comment_id, request.body.inc_votes).then((comment) => {
        response.status(200).send({comment});
    }).catch((err) => {
        next(err);
    });
}

module.exports = {getArticleComments, postArticleComment, deleteComment, patchComment};