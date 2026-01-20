/**
 * ESSENZA Webhook Routes
 * Handles incoming webhooks from Shopify
 */

const express = require('express');
const router = express.Router();

const webhookService = require('../services/webhook');
const shopifyService = require('../services/shopify');
const { verifyShopifyWebhook, apiKeyAuth } = require('../middleware/auth');

/**
 * POST /api/webhooks/shopify
 * Handle all Shopify webhooks
 */
router.post('/shopify', verifyShopifyWebhook, async (req, res) => {
    try {
        const topic = req.headers['x-shopify-topic'];
        const shopDomain = req.headers['x-shopify-shop-domain'];
        const data = req.body;

        console.log(`Received Shopify webhook: ${topic} from ${shopDomain}`);

        const result = await webhookService.processWebhook(topic, data);

        res.status(200).json(result);

    } catch (error) {
        console.error('Webhook processing error:', error);
        // Always return 200 to prevent Shopify from retrying
        res.status(200).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/webhooks/setup
 * Setup required webhooks with Shopify
 */
router.post('/setup', apiKeyAuth, async (req, res) => {
    try {
        const { baseUrl } = req.body;

        if (!baseUrl) {
            return res.status(400).json({ error: 'baseUrl is required' });
        }

        const webhookAddress = `${baseUrl}/api/webhooks/shopify`;
        const topics = webhookService.getRequiredWebhookTopics();
        const results = [];

        for (const topic of topics) {
            try {
                const webhook = await shopifyService.registerWebhook(topic, webhookAddress);
                results.push({ topic, success: true, webhookId: webhook.id });
            } catch (error) {
                results.push({ topic, success: false, error: error.message });
            }
        }

        res.json({
            success: true,
            message: 'Webhook setup completed',
            results,
        });

    } catch (error) {
        console.error('Webhook setup error:', error);
        res.status(500).json({ error: 'Failed to setup webhooks' });
    }
});

/**
 * GET /api/webhooks/list
 * List all registered webhooks
 */
router.get('/list', apiKeyAuth, async (req, res) => {
    try {
        const webhooks = await shopifyService.listWebhooks();

        res.json({
            success: true,
            count: webhooks.length,
            webhooks: webhooks.map(w => ({
                id: w.id,
                topic: w.topic,
                address: w.address,
                createdAt: w.created_at,
            })),
        });

    } catch (error) {
        console.error('Error listing webhooks:', error);
        res.status(500).json({ error: 'Failed to list webhooks' });
    }
});

/**
 * DELETE /api/webhooks/:webhookId
 * Delete a webhook
 */
router.delete('/:webhookId', apiKeyAuth, async (req, res) => {
    try {
        const { webhookId } = req.params;

        const success = await shopifyService.deleteWebhook(webhookId);

        if (success) {
            res.json({ success: true, message: 'Webhook deleted' });
        } else {
            res.status(500).json({ error: 'Failed to delete webhook' });
        }

    } catch (error) {
        console.error('Error deleting webhook:', error);
        res.status(500).json({ error: 'Failed to delete webhook' });
    }
});

/**
 * POST /api/webhooks/test
 * Test webhook endpoint
 */
router.post('/test', (req, res) => {
    console.log('Test webhook received:', req.body);
    res.json({ success: true, message: 'Webhook test successful', received: req.body });
});

module.exports = router;
