const smsMessagesModel = require('../models/index').smsMessagesModel;
const { DateTime } = require('luxon');

async function insertSmsToMongo(data) {
    var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
	//console.log('data.phone_number: ',data.phone_number)
    var iin = data.iin;
    var phone_number = data.phone_number;
    var dataToInsert = {
        "iin": iin,
        "phone_number": phone_number,
        "sms_body": data.smsBody,
        "requested_at": currentDate.toString(),
        'result_code': null,
        'result_text': null,
        'date_completed_by_sms_consult': null,
        'sms_id': null
    };
    try{
        let smsMessageObject = await smsMessagesModel.create(dataToInsert);
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

module.exports = insertSmsToMongo;