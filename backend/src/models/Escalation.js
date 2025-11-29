const mongoose = require('mongoose');

const escalationSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    index: true
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  reason: {
    type: String,
    enum: ['timeout', 'geofence', 'manual', 'high_priority'],
    required: true
  },
  escalatedAt: {
    type: Date,
    default: Date.now
  },
  notifiedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notifiedAt: Date,
    method: {
      type: String,
      enum: ['whatsapp', 'sms', 'email']
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed']
    }
  }],
  retryCount: {
    type: Number,
    default: 0
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date
}, {
  timestamps: true
});

escalationSchema.index({ reportId: 1, escalatedAt: -1 });
escalationSchema.index({ resolved: 1, escalatedAt: -1 });

module.exports = mongoose.model('Escalation', escalationSchema);
