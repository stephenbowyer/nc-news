const db = require('../db/connection.js');
const format = require('pg-format');

function selectArticleComments(articleId){
    if (!(/^\d+$/.test(articleId)))
        return Promise.reject({status: 400, msg: "Bad Request"});
    const queryString = format(`SELECT * FROM comments WHERE article_id = %L ORDER BY created_at DESC`, [articleId]);
    return db.query(queryString).then((result) => {
        return result.rows;
    });
}

module.exports = {selectArticleComments};