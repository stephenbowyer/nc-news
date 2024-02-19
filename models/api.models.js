const fs = require('fs/promises');

function readEndpoints(){
    return fs.readFile(`./endpoints.json`, 'utf8').then((result) => {
        return JSON.parse(result);
    });
}

module.exports = {readEndpoints}