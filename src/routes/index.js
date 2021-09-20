const { Router } = require('express');

const router = Router();

var cookieParser = require('cookie-parser');
var checkRandomCodeValidity = require('../services/checkRandomCodeValidity');
var getNumber = require('../services/getNumber');
var insertGeneratedCodeToMongo = require('../services/insertGeneratedCodeToMongo');
var sendSms = require('../services/sendSms');
var checkSmsStatus = require('../services/checkSmsStatus');
var findAllUnsentSms = require('../services/findAllUnsentSms');
var blockSmsSpamByIINAndPhone = require('../services/blockSmsSpamByIINAndPhone');
var checkBlockByIINAndPhone = require('../services/checkBlockByIINAndPhone');
var checkBlockByDeviceId = require('../services/checkBlockByDeviceId');
var checkBlockByGeneral = require('../services/checkBlockByGeneral');





var checkSmsAction = require('../services/checkSmsAction');
var isAuthenticated = require('../services/isAuthenticated');
var confirmPhoneNumber = require('../services/confirmPhoneNumber');
var checkPhoneNumber = require('../services/checkPhoneNumber');



router.use(cookieParser());
router.get('/', async (req, res) => {
    res.send('back-sms get /');
});

router.post('/sendSMS/', checkSmsAction, getNumber, checkBlockByDeviceId, checkBlockByIINAndPhone, insertGeneratedCodeToMongo,  async(req, res) => {
    //console.log('main');
    try{
        var result = await sendSms(req.body);
        var timeLeft = await blockSmsSpamByIINAndPhone(req.body, {iin: req.body.iin});
        result.timeLeft = timeLeft;
        res.send(result);   
    }
    catch(e){
        res.status(500).send({
            status: 'error',
            value: e.message || e
        });	
    }
 
});

router.post('/sendSmsToPhoneNumber/', isAuthenticated, checkPhoneNumber, checkBlockByGeneral, checkBlockByIINAndPhone, insertGeneratedCodeToMongo,  async(req, res) => {
    //console.log('main');
    try{
        var result = await sendSms(req.body);
        //var result = {status: "adlet"};
        var timeLeft = await blockSmsSpamByIINAndPhone(req.body, req.user);
        result.timeLeft = timeLeft;
        res.send(result);   
    }
    catch(e){
        res.status(500).send({
            status: 'error',
            value: e.message || e
        });	
    }
 
});

router.post('/checkSmsCodeValidity', checkRandomCodeValidity);

router.post('/checkAndUpdateUnsentSMSStatuses', async(req, res) => {
    var allUnsentMessages = await findAllUnsentSms();
    if (allUnsentMessages.status == 'success'){
        var messages = allUnsentMessages.value;
        var arrayToCheck = [];
        if(messages.length > 0){
            messages.forEach((message) => {
                if (message.sms_id) { //без sms_id не сможем проверить статус
                    arrayToCheck.push({
                        _id: message._id,
                        sms_id: message.sms_id
                    })
                }
            })
            //console.log('arrayToCheck: ',arrayToCheck)
            var chechResult = await checkSmsStatus(arrayToCheck);
            if(chechResult.status == 'success'){
                res.send(chechResult);
            }
            else{
                res.status(500).send(chechResult);
            }
            
        }
        else{
            res.status(500).send('no data to chek in db');
        }
    }
    else{
        res.status(500).send(allUnsentMessages);
    }
    
});

router.post('/confirmPhoneNumber', isAuthenticated, confirmPhoneNumber);

module.exports = router;