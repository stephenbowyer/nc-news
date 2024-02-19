const db = require('../db/connection.js');
const format = require('pg-format');

function selectArticle(articleId){
    if (!(/^\d+$/.test(articleId)))
        return Promise.reject({status: 400, msg: "Bad Request"});
    const queryString = format('SELECT * FROM ARTICLES WHERE article_id = %L', [articleId]);
    return db.query(queryString).then((result) => {
        if (result.rowCount === 0)
            return Promise.reject({status: 404, msg: "Not Found"});
        return result.rows[0];
      });
}

function selectAllArticles(){
    const queryString = `
        SELECT articles.article_id, articles.title, articles.topic,
            articles.author, articles.created_at,
            articles.votes, articles.article_img_url,
            COUNT(comments.body) AS comment_count
        FROM articles
        LEFT JOIN comments
            ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC
    `;
    return db.query(queryString).then((result) => {
        if (result.rowCount === 0)
            return Promise.reject({status: 404, msg: "Not Found"});
        return result.rows;
      });
}

module.exports = {selectArticle, selectAllArticles};