/**
 * ESSENZA Backend Configuration
 * Loads and validates environment variables
 */

require('dotenv').config();

const config = {
    // Server
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',

    // API Security
    apiSecretKey: process.env.API_SECRET_KEY,
    jwtSecret: process.env.JWT_SECRET,

    // Shopify
    shopify: {
        shopDomain: process.env.SHOPIFY_SHOP_DOMAIN,
        apiKey: process.env.SHOPIFY_API_KEY,
        apiSecret: process.env.SHOPIFY_API_SECRET,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
        apiVersion: process.env.SHOPIFY_API_VERSION || '2024-01',
        webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET,
    },

    // MongoDB
    mongodbUri: process.env.MONGODB_URI,

    // Email
    email: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.EMAIL_FROM || 'info@bio-eta.de',
        fromName: process.env.EMAIL_FROM_NAME || 'Bio-eta Essenza',
    },

    // CORS
    allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:8080'],

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },
};

// Validate required configuration
function validateConfig() {
    const required = [
        'shopify.shopDomain',
        'shopify.accessToken',
    ];

    const missing = [];

    for (const key of required) {
        const keys = key.split('.');
        let value = config;
        for (const k of keys) {
            value = value?.[k];
        }
        if (!value) {
            missing.push(key);
        }
    }

    if (missing.length > 0 && config.nodeEnv === 'production') {
        console.error('Missing required configuration:', missing.join(', '));
        process.exit(1);
    } else if (missing.length > 0) {
        console.warn('Warning: Missing configuration (OK for development):', missing.join(', '));
    }
}

validateConfig();

module.exports = config;
