const {blockSmsSpamModel} = require('../models/index');
const {blockMinutesAfterFixedAmountOfSmsGeneral} = require('../../configs/smsConfig');
const { DateTime } = require('luxon');

async function blockSmsSpamByDevice(body) {
    console.log('blockSmsSpamByDevice');
    var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
    try{
        var current_timestamp_plus_fixed_time = currentDate.plus({ minutes: blockMinutesAfterFixedAmountOfSmsGeneral }).toJSDate();
        var blockObject = await blockSmsSpamModel.findOneAndUpdate({deviceId: body.deviceId}, { block_until: current_timestamp_plus_fixed_time }, {
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

module.exports = blockSmsSpamByDevice;