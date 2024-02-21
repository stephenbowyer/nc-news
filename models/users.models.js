const db = require('../db/connection.js');

function selectAllUsers(){
    const queryString = 'SELECT * FROM users';
    return db.query(queryString).then((result) => {
        return result.rows;
      });

}

module.exports = {selectAllUsers};
