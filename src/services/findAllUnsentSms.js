const smsMessagesModel = require('../models/index').smsMessagesModel;

async function findAllUnsentSms() {
    try{
        let smsMessageObject = await smsMessagesModel.find({ result_code: { $in: ['100', '101'] } });
        return {
            status: 'success',
            value: smsMessageObject
        };
    }
    catch(e){
        return {
            status: 'error',
            value: e.message || e
        };
    }
}

module.exports = findAllUnsentSms;