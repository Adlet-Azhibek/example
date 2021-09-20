const axios = require('axios');
const HTTP_CONFIGS = require('../../configs/http');

async function invalidateUserSessionData(cookie) {
    //req.cookies.express_session_id
    try {
        var { data } = await axios.post(HTTP_CONFIGS.invalidateUserSessionData, {}, {
            headers: {Cookie: "express_session_id="+cookie+";"}
        });
        return data.value.user;
    } catch (e) {
        //console.log(e)
        if(e.response.status == 401){
            res.status(401).send({status: 'error', value: e.response?.data?.value || 'unauthorized'});
        }
        else{
            res.status(500).send({status: 'error', value:e.message || e});
        }
    }
}
module.exports = invalidateUserSessionData;