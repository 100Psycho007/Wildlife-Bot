const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const reportSchema = new mongoose.Schema({
  caseId: {
    type: String,
    unique: true,
    default: () => `WR-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: ['whatsapp', 'voice'],
    default: 'whatsapp'
  },
  language: {
    type: String,
    default: 'en'
  },
  phoneMasked: String,
  phoneEncrypted: String,
  category: {
    type: String,
    enum: ['animal_sighting', 'injured_animal', 'abandoned_pet', 'human_wildlife_conflict', 'predator_sighting', 'other'],
    required: true
  },
  location: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: String,
    description: String,
    district: String,
    latEncrypted: String,
    lngEncrypted: String
  },
  transcript: {
    partial: String,
    final: String,
    englishTranslation: String,
    segments: [{
      text: String,
      timestamp: Number,
      confidence: Number
    }],
    audioClipUrl: String
  },
  description: {
    type: String,
    required: true
  },
  mediaUrls: [{
    type: String,
    url: String,
    mediaType: {
      type: String,
      enum: ['image', 'video', 'audio']
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'resolved', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedResponder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Responder',
    default: null
  },
  assignedOrganization: String,
  aiClassification: {
    confidence: Number,
    extractedSpecies: [String],
    urgencyKeywords: [String],
    needsManualReview: {
      type: Boolean,
      default: false
    }
  },
  notifiedVolunteers: [{
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer'
    },
    notifiedAt: Date,
    responded: Boolean
  }],
  timeline: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: String,
    details: String
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
reportSchema.index({ "location.coordinates": "2dsphere" });
reportSchema.index({ status: 1, priority: -1, createdAt: -1 });

reportSchema.methods.addTimelineEntry = function(action, performedBy, details = '') {
  this.timeline.push({
    action,
    performedBy,
    details,
    timestamp: new Date()
  });
  return this.save();
};

reportSchema.methods.assignToResponder = function(responderId, responderName) {
  this.assignedResponder = responderId;
  this.status = 'accepted';
  return this.addTimelineEntry('assigned', responderName, `Case assigned to responder`);
};

module.exports = mongoose.model('Report', reportSchema);