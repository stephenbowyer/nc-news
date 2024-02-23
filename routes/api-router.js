const apiRouter = require('express').Router();
const {getApis} = require('../controllers/api.controllers.js');
const articlesRouter = require('../routes/articles-router.js');
const commentsRouter = require('../routes/comments-router.js');
const topicsRouter = require('../routes/topics-router.js');
const usersRouter = require('../routes/users-router.js');

apiRouter.get('/', getApis);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
