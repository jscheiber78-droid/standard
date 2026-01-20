/**
 * ESSENZA Authentication Middleware
 * Handles API key validation and webhook verification
 */

const config = require('../config');
const webhookService = require('../services/webhook');

/**
 * API Key authentication middleware
 */
function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!config.apiSecretKey) {
        // No API key configured - allow in development
        if (config.isDevelopment) {
            return next();
        }
        return res.status(500).json({ error: 'API key not configured' });
    }

    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }

    if (apiKey !== config.apiSecretKey) {
        return res.status(403).json({ error: 'Invalid API key' });
    }

    next();
}

/**
 * Shopify webhook verification middleware
 */
function verifyShopifyWebhook(req, res, next) {
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];

    if (!hmacHeader) {
        return res.status(401).json({ error: 'Missing webhook signature' });
    }

    // Note: req.rawBody must be set by body-parser configuration
    const rawBody = req.rawBody;

    if (!rawBody) {
        return res.status(400).json({ error: 'Missing request body' });
    }

    const isValid = webhookService.verifyShopifyWebhook(rawBody, hmacHeader);

    if (!isValid) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    next();
}

/**
 * CORS preflight handler
 */
function handleCors(req, res, next) {
    const origin = req.headers.origin;

    if (config.allowedOrigins.includes(origin) || config.isDevelopment) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key');
        res.header('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
}

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
}

/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: Object.values(err.errors).map(e => e.message),
        });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
    }

    // Default error
    res.status(err.status || 500).json({
        error: config.isDevelopment ? err.message : 'Internal Server Error',
    });
}

module.exports = {
    apiKeyAuth,
    verifyShopifyWebhook,
    handleCors,
    requestLogger,
    errorHandler,
};
