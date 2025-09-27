const AWS = require('aws-sdk');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class MediaService {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.bucketName = process.env.AWS_S3_BUCKET;
  }

  async uploadMedia(mediaBuffer, originalName, mimeType, caseId) {
    try {
      const fileExtension = path.extname(originalName);
      const fileName = `${caseId}/${uuidv4()}${fileExtension}`;
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: mediaBuffer,
        ContentType: mimeType,
        ACL: 'private', // Keep media private for security
        Metadata: {
          caseId: caseId,
          uploadedAt: new Date().toISOString()
        }
      };

      const result = await this.s3.upload(uploadParams).promise();
      
      logger.info('Media uploaded successfully', {
        caseId,
        fileName,
        location: result.Location
      });

      return {
        url: result.Location,
        key: fileName,
        mediaType: this.getMediaType(mimeType)
      };
    } catch (error) {
      logger.error('Failed to upload media', {
        caseId,
        error: error.message
      });
      throw error;
    }
  }

  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      logger.error('Failed to generate signed URL', {
        key,
        error: error.message
      });
      throw error;
    }
  }

  async deleteMedia(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
      
      logger.info('Media deleted successfully', { key });
      return true;
    } catch (error) {
      logger.error('Failed to delete media', {
        key,
        error: error.message
      });
      return false;
    }
  }

  getMediaType(mimeType) {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    }
    return 'unknown';
  }

  validateMediaFile(mimeType, fileSize) {
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Unsupported file type. Please upload images, videos, or audio files.');
    }

    if (fileSize > maxFileSize) {
      throw new Error('File too large. Maximum size is 50MB.');
    }

    return true;
  }

  async downloadMediaFromUrl(mediaUrl) {
    try {
      // This would typically download media from WhatsApp/Twilio
      // For now, we'll return a placeholder
      logger.info('Downloading media from URL', { mediaUrl });
      
      // In a real implementation, you would:
      // 1. Make HTTP request to download the media
      // 2. Validate the file
      // 3. Return buffer and metadata
      
      return {
        buffer: Buffer.from('placeholder'),
        mimeType: 'image/jpeg',
        originalName: 'whatsapp-media.jpg'
      };
    } catch (error) {
      logger.error('Failed to download media', {
        mediaUrl,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new MediaService();