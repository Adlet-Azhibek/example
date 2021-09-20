
const xmlJs = require('xml-js');
const axios = require('axios');
const sendSmsJson = require('../../configs/sendSmsJson');
const insertSmsToMongo = require('./insertSmsToMongo');
const updateSmsInMongo = require('./updateSmsInMongo');
const smsBodyFunc = require('./smsBody');
const hideFormattedPhoneNumber = require('./hideFormattedPhoneNumber');
const formatPhoneNumber = require('./formatPhoneNumber');
const getOnlyNumbers = require('./getOnlyNumbers');



const response_codes = require('../../configs/smsConsultResponseCodes');
const HTTP_CONFIGS = require('../../configs/http');
const smsConfig = require('../../configs/smsConfig');

var options = { //опции для конвертирования json <--> xml
    compact: true,
    ignoreComment: true,
    spaces: 4
};

async function sendSMS(body) {
    var data = body.smsCodeObject;
    var type = body.type;
    var phone_number = getOnlyNumbers(data.phone_number);
    var smsBody = smsBodyFunc(data);
    data.smsBody = smsBody;
    if(smsConfig.isTest && !smsConfig.allowedPhoneNumbers.includes(phone_number)){
        return {
            status: 'error',
            value:{
                "ru": 'not allowed to send sms '+phone_number+' while testing',
                "kz": 'not allowed to send sms '+phone_number+' while testing'
            }
        };
    }
    var sendSmsJsonClone = JSON.parse(JSON.stringify(sendSmsJson)); //клонируем объект чтобы не ссылался на эталонный
    var object_to_push = {};
    object_to_push['_attributes'] = {};
    object_to_push['_attributes']['recipient'] = phone_number;
    object_to_push['_attributes']['priority'] = "high";
    object_to_push['_text'] = smsBody;
    sendSmsJsonClone['package']['message']['msg'].push(object_to_push);
    var result = await insertSmsToMongo (data);
    if(result.status == 'success'){
        var _id = result.value._id;
        var config = {
            headers: {
                'content-type': 'text/xml;charset=UTF-8'
            }
        };
        var xmlBodyStr = xmlJs.json2xml(sendSmsJsonClone, options);
        try {
            var response = await axios.post('http://service.sms-consult.kz/', xmlBodyStr, config);
            if (response.status = 200) { //post запрос завершился успешно
                var responseBodyJSON = xmlJs.xml2js(response.data, options);
                if (responseBodyJSON['package']['error']) {
                    var code = responseBodyJSON['package']['error']['_text'];
                    var name = response_codes[code].name;
                    var description = response_codes[code].description;
                    //делаем запись в таблицу статистики
                    var dataToUpdate = {
                        selectDetails: {
                            '_id': _id,
                        },
                        dataToSet: {
                            'result_code': code,
                            'result_text': description,
                            'date_completed_by_sms_consult': null,
                            'sms_id': null
                        }
                    };
                    await updateSmsInMongo(dataToUpdate);
                } else {
                    var msg = responseBodyJSON['package']['message']['msg'];
                    var code = msg['_text'];
                    var sms_id = msg['_attributes']['sms_id'];
                    var description = response_codes[code].description;
                    //делаем запись в таблицу статистики
                    var dataToUpdate = {
                        selectDetails: {
                            '_id': _id,
                        },
                        dataToSet: {
                            'result_code': code,
                            'result_text': description,
                            'date_completed_by_sms_consult': null,
                            'sms_id': sms_id
                        }
                    };
                    await updateSmsInMongo(dataToUpdate);
                }
                //console.log('type: ',type);
                if(type == 'phone_number'){
                    var param_phone = formatPhoneNumber(phone_number)
                }
                else{
                    var param_phone = hideFormattedPhoneNumber(formatPhoneNumber(phone_number))
                }
                var response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                    data: [{code : 'smsSuccess', params: {par_1: param_phone}}]
                });
                return {
                    status: 'success',
                    value: response2.data[0].message
                };
                /*return {
                    status: 'success',
                    value: 'сообщение отправлено на номер ' + phone_number_hidden
                };*/
            } else {
                return {
                    status: 'error',
                    value: response
                };
            }
        } catch (e) {
            return {
                status: 'success',
                value: e.message || e
            };
        }
    }
    else{
        return (result);
    }
}

module.exports = sendSMS;