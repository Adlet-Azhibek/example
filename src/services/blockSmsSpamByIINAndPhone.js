const {blockSmsSpamModel} = require('../models/index');
const {blockMinutesAfterFixedAmountOfSms, 
        smsDelayInMinutes, 
        allowedSmsAmoutInFixedTime} = require('../../configs/smsConfig');
const { DateTime } = require('luxon');
const getOnlyNumbers = require('./getOnlyNumbers');


async function blockSmsSpamByIINAndPhone(data, user) {
    console.log('blockSmsSpamByIINAndPhone');
    var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
    //var phone_number = data.phone_number;
    console.log('user: ',user);
    var iin = user.iin;
    var phone_number = getOnlyNumbers(data.phone_number);
    var smsCount = data.smsCount;
    //console.log('smsCount: ',smsCount)
    //console.log('allowedSmsAmoutInFixedTime: ',allowedSmsAmoutInFixedTime)
    var current_timestamp = currentDate.toJSDate();
    try{
        if(smsCount >= allowedSmsAmoutInFixedTime){//количество смс отправленных за полседние пол часа ровно 3
            //блокирем на пол часа
            //console.log('блокирем на пол часа: ');
            var current_timestamp_plus_fixed_time = currentDate.plus({ minutes: blockMinutesAfterFixedAmountOfSms }).toJSDate();
            var blockObject = await blockSmsSpamModel.findOneAndUpdate({iin: iin, phone_number: phone_number}, { block_until: current_timestamp_plus_fixed_time }, {
                new: true,
                upsert: true // Make this update into an upsert
                });
        }
        else{
            var current_timestamp_plus_fixed_time = currentDate.plus({ minutes: smsDelayInMinutes }).toJSDate();
            var blockObject = await blockSmsSpamModel.findOneAndUpdate({iin: iin, phone_number: phone_number}, { block_until: current_timestamp_plus_fixed_time }, {
                new: true,
                upsert: true // Make this update into an upsert
                });
            //console.log('blockObject: ',blockObject);
        }
        return current_timestamp_plus_fixed_time - current_timestamp; //на сколько секунд заблокирован следующий запрос в миллисекундах
    }
    catch (e){
        return({
            status: 'error',
            value: e.message || e
        });
    }
}

module.exports = blockSmsSpamByIINAndPhone;