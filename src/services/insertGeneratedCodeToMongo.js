const {randomCodesModel} = require('../models/index');


const {randomCodeExpirationInMinutes} = require('../../configs/smsConfig');
const { DateTime } = require('luxon');

async function insertGeneratedCodeToMongo(req, res, next) {
    console.log('insertGeneratedCodeToMongo');
    var currentDate = DateTime.now().setZone('Asia/Almaty').setLocale('ru-KZ');
    var valid_until = currentDate.plus({minutes: randomCodeExpirationInMinutes})
    var iin = req.user?.iin || req.body.iin;
    var action = req.body.action || "";
    var phone_number = req.body.phone_number;
    var random_code = Math.floor(100000 + Math.random() * 900000) + '';
    var dataToInsert = {
        "iin": iin,
        "deviceId": req.body.deviceId,
        "phone_number": phone_number,
        "codeType": 'sms',
        "random_code": random_code,
        "generated_at": currentDate.toString(),
        "valid_until": valid_until.toString(),
        "is_used": false,
        "action": action
    };
    try{
        let smsCodeObject = await randomCodesModel.create(dataToInsert);
        req.body.smsCodeObject = smsCodeObject;
        next();
    }
    catch(e){
        res.status(500).send({
            status: 'error',
            value: e.message || e
        });
    }
}

module.exports = insertGeneratedCodeToMongo;