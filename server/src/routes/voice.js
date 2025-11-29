const express = require('express');
const voiceController = require('../controllers/voiceController');
const router = express.Router();

// Incoming call webhook
router.post('/incoming', (req, res) => voiceController.handleIncomingCall(req, res));

// Recording status callback
router.post('/recording-callback', (req, res) => voiceController.handleRecordingCallback(req, res));

// Transcription callback
router.post('/transcription-callback', (req, res) => voiceController.handleTranscriptionCallback(req, res));

module.exports = router;
