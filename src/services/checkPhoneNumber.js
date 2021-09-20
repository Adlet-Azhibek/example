const {userModel} = require('../models/index');
const axios = require('axios');

const getOnlyNumbers = require('./getOnlyNumbers');
const HTTP_CONFIGS = require('../../configs/http');

async function checkPhoneNumber(req, res, next) {
    console.log('checkPhoneNumber');
    try{
        req.body.type = 'phone_number';
        var iin = req.user.iin;
        var phone_number = getOnlyNumbers(req.body.phone_number);
        var userObj = await userModel.findOne({iin: iin}).lean();
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
        }
        else{
            next()
        }
    }
    catch(e){
        res.status(500).send( {
            status: 'error',
            value: e.message || e
        });
    }

}

module.exports = checkPhoneNumber;