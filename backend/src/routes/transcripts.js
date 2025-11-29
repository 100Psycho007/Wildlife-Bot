const express = require('express');
const Report = require('../models/Report');
const { verifyToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Stream transcript segments (for real-time transcription)
 */
router.post('/stream', verifyToken, async (req, res) => {
  try {
    const { caseId, segment } = req.body;
    
    if (!caseId || !segment) {
      return res.status(400).json({ error: 'caseId and segment required' });
    }
    
    const report = await Report.findOne({ caseId });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Initialize transcript if not exists
    if (!report.transcript) {
      report.transcript = { segments: [] };
    }
    
    // Add segment
    report.transcript.segments.push({
      text: segment.text,
      timestamp: segment.timestamp || Date.now(),
      confidence: segment.confidence || 0.9
    });
    
    // Update partial transcript
    report.transcript.partial = report.transcript.segments.map(s => s.text).join(' ');
    
    await report.save();
    
    logger.info('Transcript segment added', { caseId, segmentLength: segment.text?.length });
    
    res.json({ success: true, caseId });
  } catch (error) {
    logger.error('Failed to stream transcript', { error: error.message });
    res.status(500).json({ error: 'Failed to stream transcript' });
  }
});

/**
 * Accept final transcript
 */
router.post('/final', verifyToken, async (req, res) => {
  try {
    const { caseId, transcript, audioClipUrl } = req.body;
    
    if (!caseId || !transcript) {
      return res.status(400).json({ error: 'caseId and transcript required' });
    }
    
    const report = await Report.findOne({ caseId });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Update final transcript
    report.transcript = report.transcript || {};
    report.transcript.final = transcript.final || transcript.text;
    report.transcript.englishTranslation = transcript.englishTranslation;
    
    if (transcript.segments) {
      report.transcript.segments = transcript.segments;
    }
    
    if (audioClipUrl) {
      report.transcript.audioClipUrl = audioClipUrl;
    }
    
    await report.save();
    await report.addTimelineEntry('transcript_finalized', 'System', 'Final transcript received');
    
    logger.info('Final transcript saved', { caseId });
    
    // TODO: Publish websocket notification to dashboard
    // if (io) {
    //   io.emit('transcript:updated', { caseId, transcript: report.transcript });
    // }
    
    res.json({ success: true, caseId, transcript: report.transcript });
  } catch (error) {
    logger.error('Failed to save final transcript', { error: error.message });
    res.status(500).json({ error: 'Failed to save final transcript' });
  }
});

module.exports = router;
