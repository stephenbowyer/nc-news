const db = require('../db/connection.js');

function selectAllUsers(){
    const queryString = 'SELECT * FROM users';
    return db.query(queryString).then((result) => {
        return result.rows;
      });
}

function selectUser(username){
  const queryString = 'SELECT * FROM users WHERE username = $1';
  return db.query(queryString, [username]).then((result) => {
      if (result.rowCount === 0)
        return Promise.reject({status: 404, msg: "Not Found"});
      return result.rows[0];
    });

}

module.exports = {selectAllUsers, selectUser};
