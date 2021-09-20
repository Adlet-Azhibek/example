const {blockSmsSpamModel, randomCodesModel} = require('../models/index');
const axios = require('axios');
const HTTP_CONFIGS = require('../../configs/http');
const { DateTime } = require('luxon');
const hideFormattedPhoneNumber = require('./hideFormattedPhoneNumber');
const formatPhoneNumber = require('./formatPhoneNumber');
const getOnlyNumbers = require('./getOnlyNumbers');
const {fixedTimeToCheckInMinutes} = require('../../configs/smsConfig');


async function checkBlockByIINAndPhone(req, res, next) {
    console.log('checkBlockByIINAndPhone');
    try{ 
        var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
        //console.log('checkBlockObjectByIINAndPhone');
        var type = req.body.type;
        var iin = req.user?.iin || req.body.iin;
        var phone_number = getOnlyNumbers(req.body.phone_number);
        var current_timestamp = currentDate.toJSDate();
        var blockObject = await blockSmsSpamModel.findOne({iin: iin, phone_number: phone_number});
        console.log('blockObject: ',blockObject);
        if(blockObject && blockObject.block_until > current_timestamp){
            if(type == 'phone_number'){
                var param_phone = formatPhoneNumber(phone_number)
            }
            else{
                var param_phone = hideFormattedPhoneNumber(formatPhoneNumber(phone_number))
            }
            var response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                data: [{code : 'smsSuccess', params: {par_1: param_phone}}]
            });
            res.send({
                status: 'success',
                timeLeft: blockObject.block_until - current_timestamp,
                value: response2.data[0].message
            });
            return;
        }
        else{
            var randomCodeSelectDetails = {
                codeType: 'sms',
                iin: iin,
                phone_number: phone_number,
                generated_at: {
                    $lt: current_timestamp,
                    $gt: currentDate.minus({ minutes: fixedTimeToCheckInMinutes }).toString()
                }
            };
            var randomSmsCodeArray = await randomCodesModel.find(randomCodeSelectDetails).sort({ generated_at: -1 })
            
            var smsCount = randomSmsCodeArray.length+1;
            console.log('smsCount: ',smsCount)
            req.body.smsCount = smsCount;
            next()
        } 
    }
    catch (e){
        res.status(500).send({
            status: 'error',
            value: e.message || e
        });
    }
    
}

module.exports = checkBlockByIINAndPhone;