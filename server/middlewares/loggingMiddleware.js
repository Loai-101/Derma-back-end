const winston = require('winston');
const morgan = require('morgan');

// Create a stream object with a write function
const stream = {
    write: (message) => {
        winston.info(message.trim());
    }
};

// Skip logging for specific paths
const skip = (req, res) => {
    const skipPaths = ['/health', '/metrics'];
    return skipPaths.includes(req.path);
};

// Custom token for request body
morgan.token('body', (req) => {
    if (req.body && Object.keys(req.body).length > 0) {
        return JSON.stringify(req.body);
    }
    return '';
});

// Custom token for response body
morgan.token('response-body', (req, res) => {
    if (res.body && Object.keys(res.body).length > 0) {
        return JSON.stringify(res.body);
    }
    return '';
});

// Request logging middleware
exports.requestLogger = morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
    { stream, skip }
);

// Detailed request logging middleware
exports.detailedLogger = morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms\nBody: :body\nResponse: :response-body',
    { stream, skip }
);

// Error logging middleware
exports.errorLogger = (err, req, res, next) => {
    winston.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user ? req.user.id : 'anonymous',
        ip: req.ip
    });
    next(err);
};

// Performance monitoring middleware
exports.performanceLogger = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

        winston.info({
            type: 'performance',
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration.toFixed(2)}ms`,
            user: req.user ? req.user.id : 'anonymous'
        });
    });

    next();
};

// Security logging middleware
exports.securityLogger = (req, res, next) => {
    // Log potential security issues
    const securityChecks = {
        hasXSS: /<script>|javascript:|on\w+\s*=|data:/i.test(req.url),
        hasSQLInjection: /(\%27)|(\')|(\-\-)|(\%23)|(#)/i.test(req.url),
        hasPathTraversal: /\.\.\//.test(req.url)
    };

    if (Object.values(securityChecks).some(check => check)) {
        winston.warn({
            type: 'security',
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            securityChecks
        });
    }

    next();
}; 