/**
 * ESSENZA Webhook Service
 * Handles incoming webhooks from Shopify and external services
 */

const crypto = require('crypto');
const config = require('../config');

class WebhookService {
    /**
     * Verify Shopify webhook signature
     */
    verifyShopifyWebhook(rawBody, hmacHeader) {
        if (!config.shopify.webhookSecret) {
            console.warn('Webhook secret not configured - skipping verification');
            return true;
        }

        const generatedHash = crypto
            .createHmac('sha256', config.shopify.webhookSecret)
            .update(rawBody, 'utf8')
            .digest('base64');

        return crypto.timingSafeEqual(
            Buffer.from(generatedHash),
            Buffer.from(hmacHeader)
        );
    }

    /**
     * Handle customer created webhook
     */
    async handleCustomerCreated(data) {
        console.log('Customer created:', data.id, data.email);

        // Check if customer has essenza tag
        if (data.tags && data.tags.includes('essenza')) {
            // Customer was created through questionnaire
            console.log('Essenza customer created:', data.email);
        }

        return { success: true, action: 'customer_created' };
    }

    /**
     * Handle customer updated webhook
     */
    async handleCustomerUpdated(data) {
        console.log('Customer updated:', data.id, data.email);
        return { success: true, action: 'customer_updated' };
    }

    /**
     * Handle order created webhook
     * Can be used to link orders to questionnaire data
     */
    async handleOrderCreated(data) {
        console.log('Order created:', data.id, data.order_number);

        // Check if order is for Essenza product
        const essenzaItems = data.line_items?.filter(item =>
            item.title?.toLowerCase().includes('essenza')
        );

        if (essenzaItems && essenzaItems.length > 0) {
            console.log('Essenza order detected:', data.order_number);
            // Could trigger additional processing here
        }

        return { success: true, action: 'order_created' };
    }

    /**
     * Handle order fulfilled webhook
     */
    async handleOrderFulfilled(data) {
        console.log('Order fulfilled:', data.id, data.order_number);
        return { success: true, action: 'order_fulfilled' };
    }

    /**
     * Process webhook based on topic
     */
    async processWebhook(topic, data) {
        console.log(`Processing webhook: ${topic}`);

        switch (topic) {
            case 'customers/create':
                return this.handleCustomerCreated(data);

            case 'customers/update':
                return this.handleCustomerUpdated(data);

            case 'orders/create':
                return this.handleOrderCreated(data);

            case 'orders/fulfilled':
                return this.handleOrderFulfilled(data);

            default:
                console.log(`Unhandled webhook topic: ${topic}`);
                return { success: true, action: 'unhandled', topic };
        }
    }

    /**
     * Get list of webhook topics we want to subscribe to
     */
    getRequiredWebhookTopics() {
        return [
            'customers/create',
            'customers/update',
            'orders/create',
            'orders/fulfilled',
        ];
    }
}

module.exports = new WebhookService();
