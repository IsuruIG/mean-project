const mongoose = require('mongoose');
const uniqueValiator = require("mongoose-unique-validator");
const { use } = require('../routes/user');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, //unique won't validate the value, only for performance things.
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValiator); // Will get an error whne unique validation is failed.

module.exports = mongoose.model('User', userSchema);
