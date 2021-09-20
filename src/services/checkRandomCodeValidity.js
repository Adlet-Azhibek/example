const {randomCodesModel} = require('../models/index');
const axios = require('axios');
const HTTP_CONFIGS = require('../../configs/http');
const { DateTime } = require('luxon');
/*const {
    uuid
} = require('uuidv4');*/

const { v4 } =  require('uuid');
/**
 * проверяет введенный код в базе, не просрочен ли, совпадает ли, или уже не использован ли
 * @param 
 * @returns
 */

async function checkRandomCodeValidity(req, res, next) {
    var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
    var randomCode = req.body.randomCode;
    var iin = req.body.iin;
    if(!randomCode || !iin){
        res.status(500).send({
            status: 'error',
            value: 'invalid params'
        })
        return;
    }
    try{
        var randomCodeObject = await randomCodesModel.findOne({ iin: iin, random_code: randomCode, codeType: 'sms'});
        var current_timestamp = new Date(currentDate.toString());
        if(randomCodeObject && Object.keys(randomCodeObject).length > 0){
            if(randomCodeObject.is_used == false){
                if(randomCodeObject.valid_until > current_timestamp){
                    //var uuid = v4();
                    //console.log('randomCodeObject: ',randomCodeObject)
                    res.status(200).send({
                        status: 'success',
                        value: 'validCode',
                        smsId: randomCodeObject._id
                    });
                }
                else{
                    let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                        data: [{code : 'expiredSmsCode'}]
                    });
                    res.status(500).send( {
                        status: 'error',
                        value: response2.data[0].message || {
                                                                ru: 'SMS-код просрочен',
                                                                kz: 'SMS-код просрочен'
                                                            }
                    });
                }
            }
            else{
                let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                    data: [{code : 'smsCodeAlreadyUsed'}]
                });
                res.status(500).send( {
                    status: 'error',
                    value: response2.data[0].message || {
                                                            ru: "SMS-код уже использован",
                                                            kz: "SMS-код уже использован"
                                                        }
                });
            }

        }
        else{
            let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                data: [{code : 'invalidSmsCode'}]
            });
            res.status(500).send( {
                status: 'error',
                value: response2.data[0].message || {
                                                        ru: "Введен неправильный код",
                                                        kz: "Введен неправильный код"
                                                    }
            });
        }
    }
    catch (e){
        //console.log('e: ', e)
        res.status(500).send({
            status: 'error',
            value: e.message || e
        });
    }
}

module.exports = checkRandomCodeValidity;