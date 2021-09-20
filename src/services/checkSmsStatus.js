
const xmlJs = require('xml-js');
const axios = require('axios');
const checkSmsStatusJson = require('../../configs/checkSmsStatusJson');
const updateSmsInMongo = require('./updateSmsInMongo');
const response_codes = require('../../configs/smsConsultResponseCodes');
//const { DateTime } = require('luxon');

var options = { //опции для конвертирования json <--> xml
    compact: true,
    ignoreComment: true,
    spaces: 4
};

async function checkSmsStatus(arrayToCheck) {
    //var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
    var checkSmsStatusJsonClone = JSON.parse(JSON.stringify(checkSmsStatusJson)); //клонируем объект чтобы не ссылался на эталонный
    if (arrayToCheck.length > 0) {
        arrayToCheck.forEach(function (param) {
            var sms_id = param.sms_id;
            var object_to_push = {};
            object_to_push['_attributes'] = {};
            object_to_push['_attributes']['sms_id'] = sms_id;
            //object_to_push['_attributes']['_id'] = _id;
            checkSmsStatusJsonClone['package']['status']['msg'].push(object_to_push);
        })
        var config = {
            headers: {
                'content-type': 'text/xml;charset=UTF-8'
            }
        };
        var xmlBodyStr = xmlJs.json2xml(checkSmsStatusJsonClone, options);
        try {
            var response = await axios.post('http://service.sms-consult.kz/', xmlBodyStr, config);
            if (response.status = 200) {
                //console.log('response.data: \n', response.data)
                //return;
                var responseBodyJSON = xmlJs.xml2js(response.data, options);
                if (responseBodyJSON['package']['error']) {
                    //не удалось получить статус смс, запрос сформирован не правильно, или параметры переданы не правильно
                    var code = responseBodyJSON['package']['error']['_text'];
                    var description = response_codes[code].description;
                    //делаем запись в таблицу статистики
                    //var result_2 = /*await*/ pool.query('update mcorp.sms_messages set result_code = $1, result_text = $2, date_completed_by_sms_consult = $3, invalidated_at = CURRENT_TIMESTAMP where sms_id = $4', [code, description, date, sms_id]);
                } else {
                    var msg = responseBodyJSON['package']['status']['msg'];
                    var valueToSend = []
                    if (msg.forEach) { //значит msg это массив, зачит было отправленео несколько сообщений одним запросом
                        msg.forEach(async function (item) {
                            var code = item['_text'];
                            var sms_id = item['_attributes']['sms_id'];
                            valueToSend.push(sms_id);
                            var description = response_codes[code].description;
                            var date_completed = item['_attributes']['date_completed'];
                            if (date_completed) {
                                var date = new Date(date_completed);
                                //время на сервере sms-consult отстает на 3 часа, видимо это московское время
                                date.setHours(date.getHours() + 3);
                                //date_completed = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                            }
                            //делаем запись в таблицу статистики
                            var dataToUpdate = {
                                selectDetails: {
                                    'sms_id': sms_id
                                },
                                dataToSet: {
                                    'result_code': code,
                                    'result_text': description,
                                    'date_completed_by_sms_consult': date
                                }
                            }
                            //console.log('1 dataToUpdate: ',dataToUpdate);
                            var updateResult = await updateSmsInMongo(dataToUpdate);
                            //console.log('1 updateResult: ',updateResult);
                            
                        })
                    } else { //msg это не массив, зачит было отправленео только одно сообщений одним запросом
                        var code = msg['_text'];
                        var sms_id = msg['_attributes']['sms_id'];
                        valueToSend.push(sms_id);
                        var description = response_codes[code].description;
                        var date_completed = msg['_attributes']['date_completed'];
                        if (date_completed) {
                            var date = new Date(date_completed);
                            //время на сервере sms-consult отстает на 3 часа, видимо это московское время
                            date.setHours(date.getHours() + 3);
                            //date_completed = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                        }
                        //делаем запись в таблицу статистики

                        var dataToUpdate = {
                            selectDetails: {
                                'sms_id': sms_id
                            },
                            dataToSet: {
                                'result_code': code,
                                'result_text': description,
                                'date_completed_by_sms_consult': date
                            }
                        }
                        var updateResult = await updateSmsInMongo(dataToUpdate);
                        //console.log('2 updateResult: ',updateResult);
                    }
                }
                return {
                    status: 'success',
                    value: valueToSend
                };
            } else {
                return{
                    status: 'error',
                    value: 'ошибка при запрашивании статусов с sms-consult'
                };
            }
        } catch (e) {
            return{
                status: 'error',
                value: e
            };
        }

    } else {
        return{
            status: 'error',
            value: 'все неотправленные сообщения в базе не доходили до sms-consult'
        };
    }
}

module.exports = checkSmsStatus;