
const {randomCodesModel, userModel} = require('../models/index');
const invalidateUserSessionData = require('./invalidateUserSessionData');

const { DateTime } = require('luxon');
const axios = require('axios');
const HTTP_CONFIGS = require('../../configs/http');
const {nsi_phoneNumberSet} = require('../../configs/nsiServices');
const {nsiUsername, nsiPassword} = require('../../configs/nsiCreds');


async function confirmPhoneNumber(req, res, next) {
    var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
    var applicationType = req.body.applicationType || '';
    var current_timestamp = currentDate.toJSDate();
    var {randomCode} = req.body;
    var {iin} = req.user;
    if(!randomCode){
		res.status(500).send({
			status: 'error',
			value: 'invalid params'
		});
        return;
	}
    try{
        //console.log('{random_code: randomCode, iin: iin}: ',{random_code: randomCode, iin: iin})
        var randomCodeObject = await randomCodesModel.findOne({random_code: randomCode, iin: iin})
        //console.log('randomCodeObject: ',randomCodeObject);
        if(randomCodeObject && Object.keys(randomCodeObject).length > 0){
            var userObj = await userModel.findOne({iin: iin}).lean();
            var {phone_number, is_used, valid_until} = randomCodeObject;
            console.log('randomCode: ',randomCode)            
            console.log('phone_number: ',phone_number)            
            var currentTimestamp = new Date(currentDate.toString());
            if(valid_until < currentTimestamp){
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
                return;
            }
            if(is_used){
                let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                    data: [{code : 'smsCodeAlreadyUsed'}]
                });
                res.status(500).send( {
                    status: 'error',
                    value: response2.data[0].message || {
                                                            ru: 'SMS-код уже использован',
                                                            kz: 'SMS-код уже использован'
                                                        }
                });
                return;
            }
            if(userObj && userObj.phone_number === phone_number){//если новая почта такая же какая была, не давать менять
                //
                let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                    data: [{code : 'thatPhoneNumberAlreadySet'}]
                });
                res.status(500).send( {
                    status: 'error',
                    value: response2.data[0].message || {
                                                            ru: 'Этот номер телефона уже используется для вашего аккаунта',
                                                            kz: 'Этот номер телефона уже используется для вашего аккаунта'
                                                        }
                });
                /*res.status(500).send({
                    status: 'error',
                    value: 'that phone number is already set'
                })*/
                return;
            }
            else{
                var phoneNumberVerificationObject = {
                    isVerified: true,
                    date: currentDate.toJSDate(),
                    applicationType: applicationType,
                    action: 'confirmPhoneNumber'
                };
                await userModel.updateOne({iin: iin}, {
                                                        $set : {
                                                                "phone_number": phone_number,
                                                                phone_number_verification: phoneNumberVerificationObject
                                                            }
                                                        }
                );
                await randomCodesModel.findOneAndUpdate({random_code: randomCode}, { $set: {is_used: true}} );
                //находим все смс которые были запрошены до текущего момента, но еще не просроченные, и ставим им valid_until на секунду раньше текущей даты, значит что просрочен
                await randomCodesModel.updateMany({ iin: iin, action: 'confirmPhoneNumber', valid_until: {$gt : currentDate.toString()}, generated_at: { $lt: currentDate.toString()}}, { $set: {valid_until: currentDate.minus({ seconds: 1 })}} );
                var request_config = {
                    auth: {
                        username: nsiUsername,
                        password: nsiPassword
                    }
                };
                let {data} = await axios.post(nsi_phoneNumberSet, { "iin": iin, "phoneNumber": phone_number }, request_config);
                //console.log('data: ',data);
                let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                    data: [{code : 'confirmPhoneSuccess'}]
                });
                
                var userData = await invalidateUserSessionData(req.cookies.express_session_id);
                res.send({
                    status: 'success',
                    value: response2.data[0].message || {
                        ru: "Ваш номер телефона успешно изменен",
                        kz: "Ваш номер телефона успешно изменен"
                    },
                    user: userData
                })
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
    catch(e){
        res.status(500).send({
            status: 'error',
            value: e.message || e
        })
    }
    


}

module.exports = confirmPhoneNumber;