const httpService = require('./http');
const router = require('./routes');
const mongo = require('./models/index');
const http = new httpService(router);

mongo.db.once('open', function () {
    console.log('mongoDB is connected')
})
http.start();