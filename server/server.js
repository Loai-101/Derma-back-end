require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const winston = require('winston');

// Configure winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Connect to MongoDB
connectDB()
    .then(() => {
        // Start server
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('Unhandled Rejection:', err);
            server.close(() => process.exit(1));
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception:', err);
            server.close(() => process.exit(1));
        });
    })
    .catch(err => {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }); 