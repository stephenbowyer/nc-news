const {selectAllUsers, selectUser} = require("../models/users.models.js");

function getUsers(request, response, next){
    selectAllUsers().then((users) => {
        response.status(200).send({users});
    }).catch((err) => {
        next(err);
    });
}

function getUser(request, response, next){
    selectUser(request.params.username).then((user) => {
        response.status(200).send({user});
    }).catch((err) => {
        next(err);
    });
}

module.exports = {getUsers, getUser};
