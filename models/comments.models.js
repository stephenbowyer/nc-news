const db = require('../db/connection.js');

function selectArticleComments(articleId){
    if (!(/^\d+$/.test(articleId)))
        return Promise.reject({status: 400, msg: "Bad Request"});
    const queryString = 'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC';
    return db.query(queryString, [articleId]).then((result) => {
        return result.rows;
    });
}

module.exports = {selectArticleComments};