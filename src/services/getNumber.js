var getPhoneNumberByIIN = require('./getPhoneNumberByIIN');
var getOnlyNumbers = require('./getOnlyNumbers');


async function getNumber(req, res, next) {
    //console.log('checkSmsType');
    var iin = req.body.iin;
    if(!iin){
        res.status(500).send({status: 'error', value: 'iin is required'});
        return;
    }
    //req.body.phone_number = '77777945569';
    //next();
    var dataByIIN = await getPhoneNumberByIIN(iin);
    if (dataByIIN.status == 'success') {
        req.body.phone_number = getOnlyNumbers(dataByIIN.value.phone_number)
        next();
    } 
    else {
        res.status(500).send(dataByIIN);
    }
}

module.exports = getNumber;