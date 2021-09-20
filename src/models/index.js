const mongoose = require('mongoose');

const randomCodesModel = require('./randomCodesModel');
const smsMessagesModel = require('./smsMessagesModel');
const blockSmsSpamModel = require('./blockSmsSpamModel');
const userModel = require('./userModel');


mongoose.connect('mongodb://localhost/m-lombard', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;

module.exports = {
    db,
    randomCodesModel,
    smsMessagesModel,
    blockSmsSpamModel,
    userModel
}

