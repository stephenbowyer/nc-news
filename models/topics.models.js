const db = require('../db/connection.js');

function selectAllTopics(){
    return db.query('SELECT * FROM topics;').then((result) => {
        return result.rows;
      });
}

function selectTopic(topicName){
  if (!topicName)
    return Promise.reject({status: 400, msg: "Bad Request"});
  return db.query('SELECT * FROM topics WHERE slug = $1', [topicName]).then((result) => {
      if (result.rowCount === 0)
        return Promise.reject({status: 404, msg: "Not Found"});
      return result.rows;
  });
}

module.exports = {selectAllTopics, selectTopic};