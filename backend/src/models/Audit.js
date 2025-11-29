const mongoose = require('mongoose');
const crypto = require('crypto');

const auditSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  targetId: String,
  targetType: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  ip: String,
  userAgent: String,
  hmac: {
    type: String,
    required: true
  }
}, {
  timestamps: false
});

// Prevent updates and deletes
auditSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error('Audit logs cannot be modified'));
  }
  next();
});

auditSchema.index({ actorId: 1, timestamp: -1 });
auditSchema.index({ targetId: 1, timestamp: -1 });

// Static method to create audit log with HMAC
auditSchema.statics.createLog = function(data) {
  const secret = process.env.AUDIT_HMAC_KEY || 'default-secret-change-in-production';
  
  const entry = {
    actorId: data.actorId,
    action: data.action,
    targetId: data.targetId,
    targetType: data.targetType,
    details: data.details,
    timestamp: new Date(),
    ip: data.ip,
    userAgent: data.userAgent
  };
  
  // Compute HMAC
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(entry))
    .digest('hex');
  
  entry.hmac = hmac;
  
  return this.create(entry);
};

module.exports = mongoose.model('Audit', auditSchema);
