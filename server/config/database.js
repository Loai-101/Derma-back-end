const mongoose = require('mongoose');
const winston = require('winston');

// MongoDB connection options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true, // Build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

// Create MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/derma', options);
        
        winston.info(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('connected', () => {
            winston.info('Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            winston.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            winston.warn('Mongoose disconnected from MongoDB');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                winston.info('Mongoose connection closed through app termination');
                process.exit(0);
            } catch (err) {
                winston.error('Error during mongoose connection closure:', err);
                process.exit(1);
            }
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            winston.error('Unhandled Promise Rejection:', err);
            // Close server & exit process
            mongoose.connection.close(() => {
                process.exit(1);
            });
        });

    } catch (error) {
        winston.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB; 