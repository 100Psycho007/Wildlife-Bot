const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  whatsappNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, default: '' },
  contactInfo: { email: String, alternatePhone: String },
  conversationState: {
    type: String,
    enum: ['idle', 'selecting_category', 'providing_location', 'uploading_media', 'providing_description'],
    default: 'idle'
  },
  currentReport: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.methods.resetConversation = function () {
  this.conversationState = 'idle';
  this.currentReport = null;
  return this.save();
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
