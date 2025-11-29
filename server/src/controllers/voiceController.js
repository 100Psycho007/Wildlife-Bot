const Report = require('../models/Report');
const User = require('../models/User');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');
const { VoiceResponse } = require('twilio').twiml;

class VoiceController {
    /**
     * Handle incoming voice call
     */
    async handleIncomingCall(req, res) {
        try {
            const { From, CallSid } = req.body;
            logger.info('Incoming voice call', { from: From, callSid: CallSid });

            const twiml = new VoiceResponse();

            // Welcome message
            twiml.say({ voice: 'alice' }, 'Welcome to the Wildlife First Responder Hotline.');
            twiml.pause({ length: 1 });
            twiml.say({ voice: 'alice' }, 'Please describe the emergency after the beep. Press any key when finished.');

            // Record the call
            twiml.record({
                action: '/voice/recording-callback',
                method: 'POST',
                maxLength: 120,
                transcribe: true,
                transcribeCallback: '/voice/transcription-callback',
                playBeep: true
            });

            // Fallback if no recording
            twiml.say({ voice: 'alice' }, 'We did not receive your message. Goodbye.');

            res.type('text/xml');
            res.send(twiml.toString());
        } catch (error) {
            logger.error('Error handling incoming call', { error: error.message });
            res.status(500).send('Error processing call');
        }
    }

    /**
     * Handle recording completion
     */
    async handleRecordingCallback(req, res) {
        try {
            const { RecordingUrl, CallSid, From } = req.body;
            logger.info('Recording received', { callSid: CallSid, recordingUrl: RecordingUrl });

            // We wait for transcription to create the full report, 
            // but we can create a placeholder or update if needed.
            // For now, just acknowledge.

            const twiml = new VoiceResponse();
            twiml.say({ voice: 'alice' }, 'Thank you. Your report has been recorded and is being processed.');
            twiml.hangup();

            res.type('text/xml');
            res.send(twiml.toString());
        } catch (error) {
            logger.error('Error handling recording callback', { error: error.message });
            res.status(500).send('Error processing recording');
        }
    }

    /**
     * Handle transcription callback
     */
    async handleTranscriptionCallback(req, res) {
        try {
            const { TranscriptionText, CallSid, From, RecordingUrl } = req.body;
            logger.info('Transcription received', { callSid: CallSid });

            const phoneNumber = whatsappService.extractPhoneNumber(From);

            // Find or create user
            let user = await User.findOne({ whatsappNumber: phoneNumber });
            if (!user) {
                user = new User({ whatsappNumber: phoneNumber });
                await user.save();
            }

            // Create Report
            const report = new Report({
                reporterId: user._id,
                source: 'voice',
                category: 'other', // Default, will be classified by AI later
                description: TranscriptionText || 'Voice call - no transcription available',
                status: 'pending',
                location: {
                    description: 'Voice Call - Location pending',
                    coordinates: { latitude: null, longitude: null }
                },
                transcript: {
                    final: TranscriptionText,
                    audioClipUrl: RecordingUrl,
                    language: 'en-IN' // Default assumption
                }
            });

            await report.save();
            logger.info('Voice report created', { caseId: report.caseId });

            // Notify user via WhatsApp if possible
            try {
                await whatsappService.sendCaseConfirmation(phoneNumber, report.caseId);
            } catch (err) {
                logger.warn('Failed to send WhatsApp confirmation for voice case', { error: err.message });
            }

            res.status(200).send('OK');
        } catch (error) {
            logger.error('Error handling transcription callback', { error: error.message });
            res.status(500).send('Error processing transcription');
        }
    }
}

module.exports = new VoiceController();
