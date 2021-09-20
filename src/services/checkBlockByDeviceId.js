const {blockSmsSpamModel, randomCodesModel} = require('../models/index');
const axios = require('axios');
const HTTP_CONFIGS = require('../../configs/http');
const { DateTime } = require('luxon');
const {allowedSmsAmoutInFixedTimeGeneral, fixedMinutesToCheckInMinutesGeneral, blockMinutesAfterFixedAmountOfSmsGeneral} = require('../../configs/smsConfig');
const blockSmsSpamByDevice = require('./blockSmsSpamByDevice');


async function checkBlockByDeviceId(req, res, next) {
    console.log('checkBlockByDeviceId');
    try{ 
        var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
        var current_timestamp = currentDate.toJSDate();
        var deviceId = req.body.deviceId;
        console.log('checkBlockByDeviceId deviceId: ', deviceId);
        var iin = req.body.iin;
       
        
        if(deviceId){
            var randomCodeSelectGeneral = {
                codeType: 'sms',
                deviceId: deviceId,
                generated_at: {
                    $lt: current_timestamp,
                    $gt: currentDate.minus({ minutes: fixedMinutesToCheckInMinutesGeneral }).toString()
                }
            }
            var randomCodesByDeviceArray = await randomCodesModel.distinct('iin',randomCodeSelectGeneral)
            console.log('randomCodesByDeviceArray: ',randomCodesByDeviceArray);
            console.log('iin: ',iin);
            if(randomCodesByDeviceArray.includes(iin)){//если один из трех iin, для которых есть свой таймер
                next()//есть своя проверка в следующих middleware, можно пропускать дальше
            }
            else{//новый iin
                var blockObject = await blockSmsSpamModel.findOne({deviceId: deviceId});
                //console.log('blockObject: ',blockObject);
                if(blockObject && blockObject.block_until > current_timestamp){
                    var timeLeftMilliseconds = blockObject.block_until - current_timestamp;
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
                var iinCount = randomCodesByDeviceArray.length;
                if(iinCount >= allowedSmsAmoutInFixedTimeGeneral){//новый 4-й номер, для него сразу блокируем на 30 минут
                    var blockRes = await blockSmsSpamByDevice(req.body);
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
        else{
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

module.exports = checkBlockByDeviceId;