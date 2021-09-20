const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let blockSmsSpamSchema = new Schema({
    iin: { type: String, required: false },
    phone_number: { type: String, required: false },
    deviceId: { type: String, required: false },
    block_until: { type: Date, required: false }
}, { collection: 'block_sms_spam' });

const blockSmsSpamModel = mongoose.model("block_sms_spam", blockSmsSpamSchema);

module.exports = blockSmsSpamModel;