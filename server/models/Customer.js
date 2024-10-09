const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },  // Bu satırın eklendiğinden emin olun
});

module.exports = mongoose.model('Customer', CustomerSchema);