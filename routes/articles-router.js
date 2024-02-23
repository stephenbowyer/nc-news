const articlesRouter = require('express').Router();
const {getArticle, getArticles, patchArticle} = require('../controllers/articles.controllers.js');
const {getArticleComments, postArticleComment} = require('../controllers/comments.controllers.js');

articlesRouter.get('/:article_id', getArticle)
    .get('/', getArticles)
    .get('/:article_id/comments', getArticleComments)
    .post('/:article_id/comments', postArticleComment)
    .patch('/:article_id', patchArticle);

module.exports = articlesRouter;
