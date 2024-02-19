const db = require('../db/connection.js');
const format = require('pg-format');

function selectArticle(articleId){
    if (!(/^\d+$/.test(articleId)))
        return Promise.reject({status: 500, msg: "Bad Request"});
    const queryString = format('SELECT * FROM ARTICLES WHERE article_id = %L', [articleId]);
    return db.query(queryString).then((result) => {
        if (result.rowCount === 0)
            return Promise.reject({status: 404, msg: "Not Found"});
        return result.rows[0];
      });
}


module.exports = {selectArticle};