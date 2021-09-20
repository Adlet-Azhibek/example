const axios = require('axios');
const nsiServices = require('../../configs/nsiServices');
const HTTP_CONFIGS = require('../../configs/http');
const {nsiUsername, nsiPassword} = require('../../configs/nsiCreds');

async function getPhoneNumberByIIN(iin) {
    try {
        var response = await axios.get(nsiServices.nsi_getCustomerPhoneByIin + iin,{
            auth: {
                username: nsiUsername,
                password: nsiPassword
            }
        });
        //console.log('response.data.phoneNumber: ',response.data.phoneNumber);
        //console.log('iin: ',iin);
        if(response.data.phoneNumber && response.data.phoneNumber != ''){
            return {
                status: 'success',
                value: {
                    phone_number: response.data.phoneNumber,
                    iin: iin
                }
            };
        }else{
            let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                data: [{code : 'msgNoClientPhone'}]
            });
            return {
                status: 'error',
                value: response2.data[0].message
            };
        }
    } catch (e) {
        try {
            if(e.response.status == 500){
                let response2 = await axios.get(HTTP_CONFIGS.I18N_SERVICE_URL, {
                    data: [e.response.data.message]
                });
                return {
                    status: 'error',
                    value: response2.data[0].message
                };
            }
            else{
                return {
                    status: 'error',
                    value: e.message || e
                };
            }
        } catch (e2) {
            return {
                status: 'error',
                value: e2.message || e2
            };
        }
    }
}
module.exports = getPhoneNumberByIIN;