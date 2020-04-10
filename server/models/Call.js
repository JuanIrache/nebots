// Stores call details while they are useful for the server

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mSchema = new Schema({
  _id: String,
  from: String,
  callSid: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Call', mSchema);
