const {readEndpoints} = require('../models/api.models.js');

function getApis(request, response, next){
    readEndpoints().then((endpoints) => {
        response.status(200).send({endpoints});
    }).catch((err) => {
        next(err);
    });
}

module.exports = {getApis};