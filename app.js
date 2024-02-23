const express = require('express');
const app = express();
app.use(express.json());

const apiRouter = require('./routes/api-router.js');

app.use('/api', apiRouter);

app.use((err,request,response,next) => {
    if (err.status && err.msg)
        response.status(err.status).send({msg: err.msg})

    next(err);
});

app.use((err,request,response,next) => {
    if (err.code === '23503') // PSQL: Key not present in table
        response.status(404).send({msg: "Not Found"})

    if (err.code.startsWith('22P')) // PSQL: Invalid data (various)
        response.status(400).send({msg: "Bad Request"})
});

module.exports = app;
