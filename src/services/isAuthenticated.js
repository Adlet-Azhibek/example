const axios = require('axios');
const isAuthenticatedUrl = require('../../configs/authConfig').isAuthenticatedUrl;

async function isAuthenticated(req, res, next) {
    try {
        var { data } = await axios.post(isAuthenticatedUrl, {}, {
            headers: {Cookie: "express_session_id="+req.cookies.express_session_id+";"}
        });
        if(data.value.isAuthenticated){
            req.isAuthenticated = data.value.isAuthenticated;
            req.user = data.value.user;
            req.session = data.value.session;
            next();
        }
        else{
            res.status(401).send({status: 'error', value: data.value || 'unauthorized'});
        }
    } catch (e) {
        //console.log(e)
        if(e.response?.status == 401){
            res.status(401).send({status: 'error', value: e.response?.data?.value || 'unauthorized'});
        }
        else{
            res.status(500).send({status: 'error', value:e.message || e});
        }
    }
}
module.exports = isAuthenticated;