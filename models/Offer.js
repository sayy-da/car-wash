const mongoose = require('mongoose');
const offerSchema = new mongoose.Schema({
  name: String,
  from: Date,
  upto: Date,
  description: String
});
module.exports = mongoose.model('Offer', offerSchema);