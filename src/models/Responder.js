const mongoose = require('mongoose');

const responderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  whatsappNumber: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  organization: String,
  categoriesHandled: [{
    type: String,
    enum: ['animal_sighting', 'injured_animal', 'abandoned_pet', 'human_wildlife_conflict', 'other']
  }],
  location: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: String,
    serviceRadius: {
      type: Number,
      default: 25 // km
    }
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'busy'],
    default: 'offline'
  },
  currentCases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  maxConcurrentCases: {
    type: Number,
    default: 3
  },
  contactInfo: {
    phone: String,
    emergencyContact: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
responderSchema.index({ "location.coordinates": "2dsphere" });
responderSchema.index({ status: 1, categoriesHandled: 1 });

responderSchema.methods.canAcceptCase = function() {
  return this.status === 'online' && this.currentCases.length < this.maxConcurrentCases;
};

responderSchema.methods.acceptCase = function(caseId) {
  if (!this.canAcceptCase()) {
    throw new Error('Responder cannot accept more cases');
  }
  
  this.currentCases.push(caseId);
  if (this.currentCases.length >= this.maxConcurrentCases) {
    this.status = 'busy';
  }
  return this.save();
};

responderSchema.methods.completeCase = function(caseId) {
  this.currentCases = this.currentCases.filter(id => !id.equals(caseId));
  if (this.status === 'busy' && this.currentCases.length < this.maxConcurrentCases) {
    this.status = 'online';
  }
  return this.save();
};

module.exports = mongoose.model('Responder', responderSchema);