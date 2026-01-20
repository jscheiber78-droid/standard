/**
 * ESSENZA Shopify Service
 * Handles all Shopify API interactions including Metafields and Customer data
 */

const config = require('../config');

class ShopifyService {
    constructor() {
        this.shopDomain = config.shopify.shopDomain;
        this.accessToken = config.shopify.accessToken;
        this.apiVersion = config.shopify.apiVersion;
        this.baseUrl = `https://${this.shopDomain}/admin/api/${this.apiVersion}`;
    }

    /**
     * Make authenticated request to Shopify Admin API
     */
    async makeRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}`;

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': this.accessToken,
            },
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Shopify API Error: ${response.status} - ${errorBody}`);
            }

            // Handle empty responses (e.g., DELETE)
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            console.error('Shopify API Request Error:', error);
            throw error;
        }
    }

    /**
     * Find customer by email
     */
    async findCustomerByEmail(email) {
        try {
            const response = await this.makeRequest(
                `/customers/search.json?query=email:${encodeURIComponent(email)}`
            );
            return response.customers?.[0] || null;
        } catch (error) {
            console.error('Error finding customer:', error);
            return null;
        }
    }

    /**
     * Create a new customer
     */
    async createCustomer(customerData) {
        try {
            const response = await this.makeRequest('/customers.json', 'POST', {
                customer: {
                    first_name: customerData.vorname,
                    last_name: customerData.nachname,
                    email: customerData.email,
                    addresses: [{
                        address1: customerData.adresse.strasse,
                        zip: customerData.adresse.plz,
                        city: customerData.adresse.ort,
                        country: 'DE',
                    }],
                    tags: 'essenza-questionnaire',
                    accepts_marketing: true,
                },
            });
            return response.customer;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    /**
     * Get or create customer
     */
    async getOrCreateCustomer(personalData) {
        let customer = await this.findCustomerByEmail(personalData.email);

        if (!customer) {
            customer = await this.createCustomer(personalData);
        }

        return customer;
    }

    /**
     * Save questionnaire data to customer metafields
     */
    async saveQuestionnaireToMetafield(customerId, questionnaireData) {
        const metafieldData = {
            metafield: {
                namespace: 'essenza',
                key: 'questionnaire_data',
                value: JSON.stringify(questionnaireData),
                type: 'json',
            },
        };

        try {
            const response = await this.makeRequest(
                `/customers/${customerId}/metafields.json`,
                'POST',
                metafieldData
            );
            return response.metafield;
        } catch (error) {
            console.error('Error saving metafield:', error);
            throw error;
        }
    }

    /**
     * Update existing metafield
     */
    async updateMetafield(metafieldId, questionnaireData) {
        const metafieldData = {
            metafield: {
                value: JSON.stringify(questionnaireData),
            },
        };

        try {
            const response = await this.makeRequest(
                `/metafields/${metafieldId}.json`,
                'PUT',
                metafieldData
            );
            return response.metafield;
        } catch (error) {
            console.error('Error updating metafield:', error);
            throw error;
        }
    }

    /**
     * Get customer metafields
     */
    async getCustomerMetafields(customerId, namespace = 'essenza') {
        try {
            const response = await this.makeRequest(
                `/customers/${customerId}/metafields.json?namespace=${namespace}`
            );
            return response.metafields || [];
        } catch (error) {
            console.error('Error getting metafields:', error);
            return [];
        }
    }

    /**
     * Get questionnaire metafield for customer
     */
    async getQuestionnaireMetafield(customerId) {
        const metafields = await this.getCustomerMetafields(customerId);
        return metafields.find(mf => mf.key === 'questionnaire_data');
    }

    /**
     * Save categories as separate metafield (for Shopify filtering)
     */
    async saveCategoriesMetafield(customerId, categories) {
        const metafieldData = {
            metafield: {
                namespace: 'essenza',
                key: 'health_categories',
                value: JSON.stringify(categories),
                type: 'list.single_line_text_field',
            },
        };

        try {
            const response = await this.makeRequest(
                `/customers/${customerId}/metafields.json`,
                'POST',
                metafieldData
            );
            return response.metafield;
        } catch (error) {
            console.error('Error saving categories metafield:', error);
            throw error;
        }
    }

    /**
     * Add customer tag
     */
    async addCustomerTag(customerId, tag) {
        try {
            // First get current tags
            const customer = await this.makeRequest(`/customers/${customerId}.json`);
            const currentTags = customer.customer.tags || '';
            const tagsArray = currentTags.split(',').map(t => t.trim()).filter(Boolean);

            if (!tagsArray.includes(tag)) {
                tagsArray.push(tag);

                await this.makeRequest(`/customers/${customerId}.json`, 'PUT', {
                    customer: {
                        id: customerId,
                        tags: tagsArray.join(', '),
                    },
                });
            }

            return true;
        } catch (error) {
            console.error('Error adding customer tag:', error);
            return false;
        }
    }

    /**
     * Process complete questionnaire submission
     * Main entry point for questionnaire data processing
     */
    async processQuestionnaire(questionnaireData) {
        const result = {
            success: false,
            customerId: null,
            metafieldId: null,
            isNewCustomer: false,
            error: null,
        };

        try {
            // 1. Get or create customer
            let customer = await this.findCustomerByEmail(questionnaireData.personal.email);
            result.isNewCustomer = !customer;

            if (!customer) {
                customer = await this.createCustomer(questionnaireData.personal);
            }

            result.customerId = customer.id;

            // 2. Check for existing questionnaire metafield
            const existingMetafield = await this.getQuestionnaireMetafield(customer.id);

            // 3. Prepare metafield data
            const metafieldValue = {
                submissionId: questionnaireData.submissionId,
                personal: {
                    geschlecht: questionnaireData.personal.geschlecht,
                    schwangerschaft: questionnaireData.personal.schwangerschaft,
                    groesse: questionnaireData.personal.groesse,
                    gewicht: questionnaireData.personal.gewicht,
                    aktivitaet: questionnaireData.personal.aktivitaet,
                },
                kategorien: questionnaireData.kategorien,
                kategorie_antworten: questionnaireData.kategorie_antworten,
                lebensstil: questionnaireData.lebensstil,
                submittedAt: questionnaireData.timestamp || new Date().toISOString(),
            };

            // 4. Save or update metafield
            let metafield;
            if (existingMetafield) {
                metafield = await this.updateMetafield(existingMetafield.id, metafieldValue);
            } else {
                metafield = await this.saveQuestionnaireToMetafield(customer.id, metafieldValue);
            }

            result.metafieldId = metafield.id;

            // 5. Save categories as separate metafield
            await this.saveCategoriesMetafield(customer.id, questionnaireData.kategorien);

            // 6. Add tag
            await this.addCustomerTag(customer.id, 'essenza-completed');

            result.success = true;
        } catch (error) {
            result.error = error.message;
            console.error('Error processing questionnaire:', error);
        }

        return result;
    }

    /**
     * Register webhook with Shopify
     */
    async registerWebhook(topic, address) {
        try {
            const response = await this.makeRequest('/webhooks.json', 'POST', {
                webhook: {
                    topic,
                    address,
                    format: 'json',
                },
            });
            return response.webhook;
        } catch (error) {
            console.error('Error registering webhook:', error);
            throw error;
        }
    }

    /**
     * List all webhooks
     */
    async listWebhooks() {
        try {
            const response = await this.makeRequest('/webhooks.json');
            return response.webhooks || [];
        } catch (error) {
            console.error('Error listing webhooks:', error);
            return [];
        }
    }

    /**
     * Delete webhook
     */
    async deleteWebhook(webhookId) {
        try {
            await this.makeRequest(`/webhooks/${webhookId}.json`, 'DELETE');
            return true;
        } catch (error) {
            console.error('Error deleting webhook:', error);
            return false;
        }
    }
}

// Export singleton instance
module.exports = new ShopifyService();
