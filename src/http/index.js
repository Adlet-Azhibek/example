const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const ports = require('../../configs/ports');
const application = express();

class httpService {

    constructor(routes) {
        application.use(bodyParser.json())
        application.use(cors());
        application.use(routes);
    }

    start() {
        application.listen(ports.smsPort, () => {
            console.log(`Listening on ${ports.smsPort}...`);
        })
    }
}

module.exports = httpService;