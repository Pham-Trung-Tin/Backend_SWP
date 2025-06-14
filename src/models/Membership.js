const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['free', 'premium', 'pro'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  features: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;