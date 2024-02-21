const db = require('../db/connection.js');

function selectArticleComments(articleId){
    if (!(/^\d+$/.test(articleId)))
        return Promise.reject({status: 400, msg: "Bad Request"});
    const queryString = 'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC';
    return db.query(queryString, [articleId]).then((result) => {
        return result.rows;
    });
}

function insertArticleComment(articleId, newComment){
    if ((!newComment.username) || (!newComment.body) || (newComment.body.length === 0))
        return Promise.reject({status: 400, msg: "Bad Request"});
    const queryString = 'INSERT INTO comments(article_id, author, body) VALUES ($1, $2, $3) RETURNING *';
    return db.query(queryString, [articleId, newComment.username, newComment.body]).then((result) => {
        if (result.rowCount === 0)
            return Promise.reject({status: 400, msg: "Bad Request"});
        return result.rows[0];
    });
}
function removeComment(commentId){
    const queryString = 'DELETE FROM comments WHERE comment_id = $1';
    return db.query(queryString, [commentId]).then((result) => {
        if (result.rowCount === 0)
            return Promise.reject({status: 404, msg: "Not Found"});
        return {msg: "No Content"};
    });
}

module.exports = {selectArticleComments, insertArticleComment, removeComment};