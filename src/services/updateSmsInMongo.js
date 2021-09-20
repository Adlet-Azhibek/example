const smsMessagesModel = require('../models/index').smsMessagesModel;

async function updateSmsInMongo(dataToUpdate) {
	//console.log('data.phone_number: ',data.phone_number)
    var selectDetails = dataToUpdate.selectDetails;
    var dataToSet = dataToUpdate.dataToSet;
    try{
        //let smsMessageObject = await smsMessagesModel.create(dataToInsert);
        /*if(_id){
            var smsMessageObject = await smsMessagesModel.findByIdAndUpdate( _id, { $set: dataToSet } );
            
        }else{*/
            var smsMessageObject = await smsMessagesModel.findOneAndUpdate(selectDetails, { $set: dataToSet} );
        //}
        return {
            status: 'success',
            value: smsMessageObject
        };

    }
    catch(e){
        return {
            status: 'error',
            value: e.message || e
        };
    }
}

module.exports = updateSmsInMongo;