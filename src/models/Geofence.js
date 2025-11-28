const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  polygon: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays for GeoJSON Polygon
      required: true
    }
  },
  notifyOnEntry: {
    type: Boolean,
    default: true
  },
  escalatePriority: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Geospatial index for polygon queries
geofenceSchema.index({ polygon: '2dsphere' });

module.exports = mongoose.model('Geofence', geofenceSchema);
