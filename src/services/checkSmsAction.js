const {userModel} = require('../models/index');
const axios = require('axios');
const HTTP_CONFIGS = require('../../configs/http');

async function checkSmsAction(req, res, next) {
    //console.log('checkSmsType');
    var iin = req.body.iin;
    var action = req.body.action;
    if(!iin){
        res.status(500).send({status: 'error', value: 'iin is required for '+action});
        return;
    }
    try{
        var user = await userModel.findOne({iin: iin});
        if(action == 'signup'){//по иин пользователя не должно быть
            if(user){
                //
                let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                    data: [{code : 'userAlreadyExist'}]
                });
                res.status(500).send( {
                    status: 'error',
                    value: response2.data[0].message || {
                                                            ru: 'Пользователь уже зарегистрирован',
                                                            kz: 'Пользователь уже зарегистрирован'
                                                        }
                });
                return;
            }
            next()
        }
        else if(action == 'resetPassword'){ //по иин должен быть пользователь
            if(!user){
                let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                    data: [{code : 'userNotFound'}]
                });
                res.status(500).send( {
                    status: 'error',
                    value: response2.data[0].message || {
                                                            ru: 'Пользователь не найден',
                                                            kz: 'Пользователь не найден'
                                                        }
                });
                return;
            }
            next()
        }
        else{
            next();
        }
    }
    catch(e){
        res.status(500).send({status: 'error', value: e.message || e});
    }

}

module.exports = checkSmsAction;