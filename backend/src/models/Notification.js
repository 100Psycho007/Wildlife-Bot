const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  recipientType: {
    type: String,
    enum: ['user', 'responder', 'volunteer'],
    required: true
  },
  type: {
    type: String,
    enum: ['case_created', 'case_accepted', 'case_resolved', 'case_timeout', 'volunteer_request'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  sentAt: Date,
  deliveredAt: Date,
  metadata: {
    whatsappMessageId: String,
    errorMessage: String,
    retryCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

notificationSchema.index({ status: 1, createdAt: 1 });
notificationSchema.index({ reportId: 1, recipientId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);