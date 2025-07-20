
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  session: Object
});

module.exports = mongoose.model('Session', SessionSchema);
