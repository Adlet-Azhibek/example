const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let randomCodesSchema = new Schema({
    iin: { type: String, required: false },
    phone_number: { type: String, required: false },
    deviceId: { type: String, required: false },
    email: { type: String, required: false },
    codeType: { type: String, required: false },
    random_code: { type: String, required: true },
    generated_at: { type: Date, required: true },
    valid_until: { type: Date, required: true },
    is_used: { type: Boolean, required: true },
    action: { type: String, required: false }
}, { collection: 'random_codes' });

const randomCodesModel = mongoose.model("random_codes", randomCodesSchema);

module.exports = randomCodesModel;
