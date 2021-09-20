const {blockSmsSpamModel} = require('../models/index');
const {blockMinutesAfterFixedAmountOfSmsGeneral, allowedSmsAmoutInFixedTimeGeneral} = require('../../configs/smsConfig');
const { DateTime } = require('luxon');

async function blockSmsSpamByIINGeneral(body) {
    console.log('blockSmsSpamByIINGeneral');
    var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
    try{
        var current_timestamp_plus_fixed_time = currentDate.plus({ minutes: blockMinutesAfterFixedAmountOfSmsGeneral }).toJSDate();
        await blockSmsSpamModel.findOneAndUpdate({iin: body.iin, phone_number: 'general'}, { block_until: current_timestamp_plus_fixed_time }, {
            new: true,
            upsert: true // Make this update into an upsert
        }); 
        return({
            status: 'success',
            value: ''
        });
    }
    catch (e){
        return({
            status: 'error',
            value: e.message || e
        });
    }

}

module.exports = blockSmsSpamByIINGeneral;