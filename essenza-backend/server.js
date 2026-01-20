/**
 * ESSENZA Backend Server
 * Main entry point for the Bio-eta Essenza questionnaire API
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const config = require('./config');
const { handleCors, requestLogger, errorHandler } = require('./middleware/auth');

// Import routes
const questionnaireRoutes = require('./routes/questionnaire');
const webhookRoutes = require('./routes/webhooks');

// Initialize Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(handleCors);
app.use(cors({
    origin: config.allowedOrigins,
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: { error: 'Zu viele Anfragen. Bitte versuche es später erneut.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing - capture raw body for webhook verification
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    },
}));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Essenza API',
        version: '1.0.0',
        description: 'Bio-eta Essenza Questionnaire Backend',
        endpoints: {
            questionnaire: '/api/questionnaire',
            webhooks: '/api/webhooks',
            health: '/health',
        },
    });
});

// Routes
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint nicht gefunden' });
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB (if configured)
async function connectDatabase() {
    if (config.mongodbUri) {
        try {
            await mongoose.connect(config.mongodbUri);
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            if (config.nodeEnv === 'production') {
                process.exit(1);
            }
        }
    } else {
        console.warn('MongoDB URI not configured - running without database');
    }
}

// Start server
async function startServer() {
    await connectDatabase();

    const port = config.port;
    app.listen(port, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ███████╗███████╗███████╗███████╗███╗   ██╗███████╗   ║
║     ██╔════╝██╔════╝██╔════╝██╔════╝████╗  ██║╚══███╔╝   ║
║     █████╗  ███████╗███████╗█████╗  ██╔██╗ ██║  ███╔╝    ║
║     ██╔══╝  ╚════██║╚════██║██╔══╝  ██║╚██╗██║ ███╔╝     ║
║     ███████╗███████║███████║███████╗██║ ╚████║███████╗   ║
║     ╚══════╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝   ║
║                                                           ║
║                    Bio-eta Backend                        ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on port ${port}                              ║
║  Environment: ${config.nodeEnv.padEnd(40)}║
║  MongoDB: ${(config.mongodbUri ? 'Configured' : 'Not configured').padEnd(44)}║
║  Shopify: ${(config.shopify.shopDomain || 'Not configured').padEnd(44)}║
╚═══════════════════════════════════════════════════════════╝
        `);
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
