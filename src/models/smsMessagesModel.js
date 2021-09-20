const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let smsMessagesSchema = new Schema({
    iin: { type: String, required: false },
    phone_number: { type: String, required: true },
    sms_body: { type: String, required: true },
    requested_at: { type: Date, required: true },
    result_code: { type: String, required: false },
    result_text: { type: String, required: false },
    date_completed_by_sms_consult: { type: Date, required: false },
    sms_id: { type: String, required: false }
}, { collection: 'sms_messages' });

const smsMessagesModel = mongoose.model("sms_messages", smsMessagesSchema);

module.exports = smsMessagesModel;