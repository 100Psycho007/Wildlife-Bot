const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  whatsappNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, default: '' },
  email: String,
  password: String, // For dashboard users only - hashed with bcrypt
  role: {
    type: String,
    enum: ['USER', 'RESPONDER', 'ADMIN'],
    default: 'USER'
  },
  contactInfo: { email: String, alternatePhone: String },
  conversationState: {
    type: String,
    enum: ['idle', 'selecting_category', 'providing_location', 'uploading_media', 'providing_description'],
    default: 'idle'
  },
  currentReport: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.resetConversation = function () {
  this.conversationState = 'idle';
  this.currentReport = null;
  return this.save();
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
