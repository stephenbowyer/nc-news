const {selectAllUsers} = require("../models/users.models.js");

function getUsers(request, response, next){
    selectAllUsers().then((users) => {
        response.status(200).send({users});
    }).catch((err) => {
        next(err);
    });
}


module.exports = {getUsers};
