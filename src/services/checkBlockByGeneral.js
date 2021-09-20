const {blockSmsSpamModel, randomCodesModel} = require('../models/index');
const axios = require('axios');
const HTTP_CONFIGS = require('../../configs/http');
const { DateTime } = require('luxon');
const blockSmsSpamByIINGeneral = require('./blockSmsSpamByIINGeneral');
const getOnlyNumbers = require('./getOnlyNumbers');
const {fixedMinutesToCheckInMinutesGeneral, blockMinutesAfterFixedAmountOfSmsGeneral, allowedSmsAmoutInFixedTimeGeneral} = require('../../configs/smsConfig');


async function checkBlockByGeneral(req, res, next) {
    console.log('checkBlockByGeneral');
    try{ 
        var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
        //console.log('checkBlockByGeneral');
        var iin = req.user.iin
        var phone_number = getOnlyNumbers(req.body.phone_number);
        var current_timestamp = currentDate.toJSDate();
        console.log('checkBlockByGeneral iin: ',iin)
        
        var randomCodeSelectGeneral = {
            codeType: 'sms',
            iin: iin,
            generated_at: {
                $lt: current_timestamp,
                $gt: currentDate.minus({ minutes: fixedMinutesToCheckInMinutesGeneral }).toString()
            }
        }
        var randomSmsCodeArrayGeneral = await randomCodesModel.distinct('phone_number',randomCodeSelectGeneral)
        console.log('checkBlockByGeneral randomSmsCodeArrayGeneral: ',randomSmsCodeArrayGeneral)

        if(randomSmsCodeArrayGeneral.includes(phone_number)){//если один из трех номеров, для которых есть свой таймер
            next()//есть своя проверка в следующих middleware, можно пропускать дальше
        }
        else{//новый номер
            var blockObject = await blockSmsSpamModel.findOne({iin: iin, phone_number: 'general'});
            if(blockObject && blockObject.block_until > current_timestamp){
                var timeLeftMilliseconds = blockObject.block_until - currentDate.toJSDate();
                let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                    data: [{code : 'tooManyRequestsSms', params: {par_1:  new Date(timeLeftMilliseconds).getMinutes()}}]
                });
                var errorText =  response2.data[0].message || {
                    "ru": "Превышено ограничение на отправку SMS",
                    "kz": "Превышено ограничение на отправку SMS(каз)"
                }
                res.status(500).send({
                    status: 'error',
                    value: errorText
                });
                return;
            }
            var generalCount = randomSmsCodeArrayGeneral.length;
            console.log('randomSmsCodeArrayGeneral: ',randomSmsCodeArrayGeneral)
            console.log('phone_number: ',phone_number)
            if(generalCount >= allowedSmsAmoutInFixedTimeGeneral){
                var blockRes = await blockSmsSpamByIINGeneral(req.body);
                console.log('blockRes: ',blockRes);
                if(blockRes.status == 'success'){
                    var timeLeftMilliseconds = current_timestamp;
                    let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                        data: [{code : 'tooManyRequestsSms', params: {par_1:  blockMinutesAfterFixedAmountOfSmsGeneral}}]
                    });
                    var errorText =  response2.data[0].message || {
                        "ru": "Превышено ограничение на отправку SMS",
                        "kz": "Превышено ограничение на отправку SMS(каз)"
                    }
                    res.status(500).send({
                        status: 'error',
                        value: errorText
                    });
                    console.log({
                        status: 'error',
                        value: errorText
                    })
                    return;
                }
                else{
                    res.status(500).send(blockRes);
                }
            }
            else{
                next()//есть своя проверка в следующих middleware, можно пропускать дальше
            }
        }

    }
    catch (e){
        res.status(500).send({
            status: 'error',
            value: e.message || e
        });
    }
    
}

module.exports = checkBlockByGeneral;