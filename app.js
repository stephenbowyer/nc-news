const express = require('express');
const app = express();

const {getTopics} = require('./controllers/topics.controllers.js');

app.get('/api/topics', getTopics);

app.use((err,request,response,next) => {
    if (err.status && err.msg)
      response.status(err.status).send({msg: err.msg});
    else
      response.status(400).send({msg: "Bad request"});
}); 

const server = app.listen(9090, (error) => {
    if (error){
        console.log(error);
    }else{
        console.log("Listening on 9090");
    }
});

module.exports = {app, server};
