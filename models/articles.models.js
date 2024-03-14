const db = require('../db/connection.js');

function selectArticle(articleId){
    if (!(/^\d+$/.test(articleId)))
        return Promise.reject({status: 400, msg: "Bad Request"});
    
    const queryString = `
        SELECT articles.*,
            COUNT(comments.body) AS comment_count
        FROM articles
        LEFT JOIN comments
            ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC
    `;
    
    return db.query(queryString, [articleId]).then((result) => {
        if (result.rowCount === 0)
            return Promise.reject({status: 404, msg: "Not Found"});
        return result.rows[0];
      });
}

function selectAllArticles(topicName, sortBy = 'created_at', sortOrder = 'DESC'){
    const validFields = ['article_id', 'title', 'topic', 'author', 'created_at', 'votes', 'article_img_url', 'comment_count'];
    const queryParams = [];
    let queryConditions = '';
    if (!validFields.includes(sortBy.toLocaleLowerCase()))
        return Promise.reject({status: 400, msg: "Bad Request"});
    if (sortBy.toLocaleLowerCase() !== 'comment_count')
        sortBy = 'articles.'+sortBy;
    if (!((sortOrder.toUpperCase() === 'ASC') || (sortOrder.toUpperCase() === 'DESC')))
        return Promise.reject({status: 400, msg: "Bad Request"});
    if (topicName){
        queryConditions += 'WHERE articles.topic = $1';
        queryParams.push(topicName);
    }
    const queryString = `
        SELECT articles.article_id, articles.title, articles.topic,
            articles.author, articles.created_at,
            articles.votes, articles.article_img_url,
            CAST( COUNT(comments.body) AS INTEGER) AS comment_count
        FROM articles
        LEFT JOIN comments
            ON articles.article_id = comments.article_id
        ${queryConditions}
        GROUP BY articles.article_id
        ORDER BY ${sortBy} ${sortOrder}
    `;

    return db.query(queryString, queryParams).then((result) => {
        return result.rows;
    });
}

function updateArticleVotes(articleId, incVotes = 0){
    if (!(/^-?\d+$/.test(incVotes)) || !(/^\d+$/.test(articleId)))
        return Promise.reject({status: 400, msg: "Bad Request"});
    const queryString = `
        UPDATE articles SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *
        `;
    return db.query(queryString, [incVotes, articleId]).then((result) => {
        if (result.rowCount === 0)
            return Promise.reject({status: 404, msg: "Not Found"});
        return result.rows[0];
    })
}

module.exports = {selectArticle, selectAllArticles, updateArticleVotes};