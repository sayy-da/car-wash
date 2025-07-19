const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  vehicle: String,
  serviceDate: Date
});
module.exports = mongoose.model('Booking', bookingSchema);