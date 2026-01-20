/**
 * ESSENZA Questionnaire API Routes
 * Handles questionnaire submissions and data retrieval
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const Questionnaire = require('../models/Questionnaire');
const shopifyService = require('../services/shopify');
const emailService = require('../services/email');
const { apiKeyAuth } = require('../middleware/auth');
const { validateQuestionnaire } = require('../middleware/validation');

/**
 * POST /api/questionnaire
 * Submit a new questionnaire
 */
router.post('/', validateQuestionnaire, async (req, res) => {
    try {
        const data = req.body;

        // Generate unique submission ID
        const submissionId = `ESS-${Date.now().toString(36).toUpperCase()}-${uuidv4().substring(0, 6).toUpperCase()}`;

        // Prepare questionnaire document
        const questionnaireData = {
            submissionId,
            personal: data.personal,
            kategorien: data.kategorien,
            kategorie_antworten: data.kategorie_antworten || {},
            lebensstil: data.lebensstil,
            source: data.source || 'web',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        };

        // Save to MongoDB (if configured)
        let savedQuestionnaire;
        if (process.env.MONGODB_URI) {
            const questionnaire = new Questionnaire(questionnaireData);
            savedQuestionnaire = await questionnaire.save();
        }

        // Process with Shopify
        const shopifyResult = await shopifyService.processQuestionnaire({
            ...questionnaireData,
            timestamp: new Date().toISOString(),
        });

        // Update questionnaire with Shopify data
        if (savedQuestionnaire && shopifyResult.success) {
            savedQuestionnaire.shopifyCustomerId = shopifyResult.customerId;
            savedQuestionnaire.shopifyMetafieldId = shopifyResult.metafieldId;
            savedQuestionnaire.status = 'processing';
            await savedQuestionnaire.save();
        }

        // Send confirmation email
        const emailResult = await emailService.sendConfirmationEmail(questionnaireData);

        if (savedQuestionnaire && emailResult.success) {
            savedQuestionnaire.confirmationEmailSent = true;
            await savedQuestionnaire.save();
        }

        // Send admin notification
        await emailService.sendAdminNotification(questionnaireData);

        // Response
        res.status(201).json({
            success: true,
            message: 'Fragebogen erfolgreich übermittelt',
            submissionId,
            shopify: {
                customerId: shopifyResult.customerId,
                isNewCustomer: shopifyResult.isNewCustomer,
            },
        });

    } catch (error) {
        console.error('Error submitting questionnaire:', error);
        res.status(500).json({
            error: 'Fehler beim Übermitteln des Fragebogens',
            details: error.message,
        });
    }
});

/**
 * GET /api/questionnaire/:submissionId
 * Get questionnaire by submission ID
 */
router.get('/:submissionId', apiKeyAuth, async (req, res) => {
    try {
        const { submissionId } = req.params;

        const questionnaire = await Questionnaire.findOne({ submissionId });

        if (!questionnaire) {
            return res.status(404).json({ error: 'Fragebogen nicht gefunden' });
        }

        res.json({
            success: true,
            data: questionnaire,
        });

    } catch (error) {
        console.error('Error fetching questionnaire:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen des Fragebogens' });
    }
});

/**
 * GET /api/questionnaire/email/:email
 * Get questionnaires by email
 */
router.get('/email/:email', apiKeyAuth, async (req, res) => {
    try {
        const { email } = req.params;

        const questionnaires = await Questionnaire.findByEmail(email);

        res.json({
            success: true,
            count: questionnaires.length,
            data: questionnaires.map(q => q.getSummary()),
        });

    } catch (error) {
        console.error('Error fetching questionnaires:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Fragebögen' });
    }
});

/**
 * GET /api/questionnaire/customer/:shopifyCustomerId
 * Get questionnaire data from Shopify metafield
 */
router.get('/customer/:shopifyCustomerId', apiKeyAuth, async (req, res) => {
    try {
        const { shopifyCustomerId } = req.params;

        const metafield = await shopifyService.getQuestionnaireMetafield(shopifyCustomerId);

        if (!metafield) {
            return res.status(404).json({ error: 'Keine Fragebogen-Daten gefunden' });
        }

        res.json({
            success: true,
            data: JSON.parse(metafield.value),
            metafieldId: metafield.id,
        });

    } catch (error) {
        console.error('Error fetching customer questionnaire:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Kundendaten' });
    }
});

/**
 * PUT /api/questionnaire/:submissionId/status
 * Update questionnaire status
 */
router.put('/:submissionId/status', apiKeyAuth, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['submitted', 'processing', 'completed', 'error'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Ungültiger Status' });
        }

        const questionnaire = await Questionnaire.findOneAndUpdate(
            { submissionId },
            { status, notes },
            { new: true }
        );

        if (!questionnaire) {
            return res.status(404).json({ error: 'Fragebogen nicht gefunden' });
        }

        res.json({
            success: true,
            data: questionnaire.getSummary(),
        });

    } catch (error) {
        console.error('Error updating questionnaire status:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Status' });
    }
});

/**
 * GET /api/questionnaire
 * List all questionnaires (admin)
 */
router.get('/', apiKeyAuth, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        const query = {};
        if (status) {
            query.status = status;
        }

        const questionnaires = await Questionnaire.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit));

        const total = await Questionnaire.countDocuments(query);

        res.json({
            success: true,
            total,
            count: questionnaires.length,
            data: questionnaires.map(q => q.getSummary()),
        });

    } catch (error) {
        console.error('Error listing questionnaires:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Fragebögen' });
    }
});

/**
 * DELETE /api/questionnaire/:submissionId
 * Delete questionnaire (admin)
 */
router.delete('/:submissionId', apiKeyAuth, async (req, res) => {
    try {
        const { submissionId } = req.params;

        const questionnaire = await Questionnaire.findOneAndDelete({ submissionId });

        if (!questionnaire) {
            return res.status(404).json({ error: 'Fragebogen nicht gefunden' });
        }

        res.json({
            success: true,
            message: 'Fragebogen gelöscht',
        });

    } catch (error) {
        console.error('Error deleting questionnaire:', error);
        res.status(500).json({ error: 'Fehler beim Löschen des Fragebogens' });
    }
});

module.exports = router;
