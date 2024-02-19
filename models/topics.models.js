const db = require('../db/connection.js');

function selectAllTopics(){
    return db.query('SELECT * FROM topics;').then((result) => {
        return result.rows;
      });
}

module.exports = {selectAllTopics};