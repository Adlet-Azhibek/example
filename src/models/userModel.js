const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let userSchema = new Schema({
    iin: { type: String, required: false },
    phone_number: { type: String, required: true },
    phone_number_verification: { type: Object, required: false },
    role_code: { type: String, required: false },
    name: { type: String, required: false },
    email: { type: String, required: false },
    email_verification: { type: Object, required: false },
    surname: { type: String, required: false },
    fathername: { type: String, required: false },
    created_at: { type: Date, required: false },
	migrated_at: { type: Date, required: false },
    offer_accepted_at: { type: Date, required: false },
}, { collection: 'users' });

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;