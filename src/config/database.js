const mongoose = require('mongoose');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife_reports';
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      this.connection = await mongoose.connect(mongoUri, options);
      
      logger.info('Connected to MongoDB successfully', {
        host: this.connection.connection.host,
        port: this.connection.connection.port,
        database: this.connection.connection.name
      });

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error', { error: error.message });
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      return this.connection;
    } catch (error) {
      logger.error('Failed to connect to MongoDB', { error: error.message });
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', { error: error.message });
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Create indexes for better performance
      const User = require('../models/User');
      const Report = require('../models/Report');
      const Responder = require('../models/Responder');
      const Notification = require('../models/Notification');

      await User.createIndexes();
      await Report.createIndexes();
      await Responder.createIndexes();
      await Notification.createIndexes();

      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Failed to create database indexes', { error: error.message });
      throw error;
    }
  }
}

module.exports = new Database();