const Geofence = require('../models/Geofence');
const Escalation = require('../models/Escalation');
const logger = require('../utils/logger');

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function pointInPolygon(point, polygon) {
  const [lng, lat] = point;
  const coords = polygon[0]; // First ring of polygon
  
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [xi, yi] = coords[i];
    const [xj, yj] = coords[j];
    
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Check if report location is inside any active geofence
 */
async function checkGeofences(report) {
  try {
    if (!report.location?.coordinates?.latitude || !report.location?.coordinates?.longitude) {
      return null;
    }
    
    const point = [report.location.coordinates.longitude, report.location.coordinates.latitude];
    
    const geofences = await Geofence.find({ isActive: true });
    
    for (const geofence of geofences) {
      if (pointInPolygon(point, geofence.polygon.coordinates)) {
        logger.info('Report inside geofence', { 
          caseId: report.caseId, 
          geofenceName: geofence.name 
        });
        
        if (geofence.escalatePriority) {
          report.priority = 'high';
          await report.save();
          
          // Create escalation event
          const escalation = new Escalation({
            caseId: report.caseId,
            reportId: report._id,
            reason: 'geofence',
            escalatedAt: new Date(),
            notifiedUsers: []
          });
          await escalation.save();
          
          await report.addTimelineEntry('escalated', 'System', `Inside geofence: ${geofence.name}`);
        }
        
        return geofence;
      }
    }
    
    return null;
  } catch (error) {
    logger.error('Geofence check failed', { error: error.message });
    return null;
  }
}

module.exports = {
  checkGeofences,
  pointInPolygon
};
