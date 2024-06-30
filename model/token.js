const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the Token model
const tokenSchema = new Schema({
    token: { type: String, required: true },
    email: { type: String, required: true },
    userID: { type: String, required: true },
    expiration: { type: Date, required: true },
    used: { type: Boolean, default: false }, // Track whether token has been used
    // You can add more fields as needed, such as status (used, unused), timestamps, etc.
});

// Create the Token model
const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
