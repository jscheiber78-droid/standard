/**
 * Shopify API Handler for Personalized Questionnaire
 *
 * This file handles:
 * 1. Receiving questionnaire data
 * 2. Calculating nutrient concentrations
 * 3. Storing data in CSV format
 * 4. Sending data to partner API
 * 5. Daily email automation
 *
 * Installation:
 * npm install express body-parser csv-writer node-cron nodemailer axios
 *
 * Usage:
 * node api-handler.js
 */

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration
const CONFIG = {
    // Email configuration (to be updated with actual credentials)
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-password'
        },
        targetEmail: process.env.TARGET_EMAIL || 'gina.pommerenke@biovariance.com'
    },

    // Partner API configuration (to be provided by client)
    partnerApi: {
        endpoint: process.env.PARTNER_API_ENDPOINT || 'https://partner-api.example.com/submit',
        apiKey: process.env.PARTNER_API_KEY || 'your-api-key'
    },

    // Data storage paths
    dataDir: process.env.DATA_DIR || './data',
    csvPath: process.env.CSV_PATH || './data/questionnaire-responses.csv'
};

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(CONFIG.dataDir, { recursive: true });
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

ensureDataDir();

/**
 * Calculate nutrient concentrations based on questionnaire responses
 * This is a placeholder - actual calculation logic to be provided by client
 */
function calculateNutrientConcentrations(questionnaireData) {
    // Extract relevant data
    const { age, gender, weight, height, selectedAreas, sleepQuality, stressLevel, exerciseFrequency, dietQuality } = questionnaireData;

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // Initialize nutrient object with base values
    const nutrients = {
        // Core nutrients (all customers get these)
        vitaminD: 2000, // IU
        vitaminB12: 500, // mcg
        omega3: 1000, // mg
        magnesium: 300, // mg
        zinc: 15, // mg
        vitaminC: 500, // mg
        vitaminE: 200, // IU
        coq10: 100, // mg

        // NAD+ boosters
        nmn: 250, // mg
        resveratrol: 250, // mg

        // Mitochondrial support
        pqq: 20, // mg
        alphaLipoicAcid: 300, // mg

        // Additional nutrients based on needs
        curcumin: 0,
        ashwagandha: 0,
        rhodiola: 0,
        collagen: 0,
        glucosamine: 0,
        chondroitin: 0,
        biotin: 0,
        hyaluronicAcid: 0,
        quercetin: 0,
        probiotics: 0
    };

    // Age-based adjustments
    if (age > 50) {
        nutrients.vitaminD *= 1.5;
        nutrients.vitaminB12 *= 1.3;
        nutrients.coq10 *= 1.5;
        nutrients.nmn *= 1.3;
    }

    // Gender-based adjustments
    if (gender === 'female') {
        nutrients.iron = 18; // mg
        nutrients.calcium = 1000; // mg
    } else if (gender === 'male') {
        nutrients.iron = 8; // mg
        nutrients.calcium = 800; // mg
    }

    // Problem area specific adjustments
    if (selectedAreas.includes('energy')) {
        nutrients.coq10 *= 1.5;
        nutrients.vitaminB12 *= 1.5;
        nutrients.magnesium *= 1.3;
        nutrients.nmn *= 1.5;
    }

    if (selectedAreas.includes('cognition')) {
        nutrients.omega3 *= 1.5;
        nutrients.vitaminB12 *= 1.3;
        nutrients.resveratrol *= 1.5;
        nutrients.pqq *= 1.5;
        nutrients.phosphatidylserine = 200; // mg
    }

    if (selectedAreas.includes('recovery')) {
        nutrients.vitaminC *= 1.5;
        nutrients.vitaminE *= 1.3;
        nutrients.magnesium *= 1.5;
        nutrients.zinc *= 1.3;
        nutrients.bcaa = 5000; // mg
    }

    if (selectedAreas.includes('immunity')) {
        nutrients.vitaminC *= 2;
        nutrients.vitaminD *= 1.5;
        nutrients.zinc *= 2;
        nutrients.quercetin = 500; // mg
        nutrients.probiotics = 10000000000; // CFU (10 billion)
    }

    if (selectedAreas.includes('stress')) {
        nutrients.magnesium *= 1.5;
        nutrients.ashwagandha = 600; // mg
        nutrients.rhodiola = 400; // mg
        nutrients.ltheanine = 200; // mg
    }

    if (selectedAreas.includes('skin')) {
        nutrients.vitaminC *= 1.5;
        nutrients.vitaminE *= 1.5;
        nutrients.collagen = 5000; // mg
        nutrients.biotin = 5000; // mcg
        nutrients.hyaluronicAcid = 120; // mg
    }

    if (selectedAreas.includes('joints')) {
        nutrients.glucosamine = 1500; // mg
        nutrients.chondroitin = 1200; // mg
        nutrients.collagen = 5000; // mg
        nutrients.curcumin = 1000; // mg
        nutrients.msm = 1000; // mg
    }

    // Lifestyle-based adjustments
    if (stressLevel >= 7) {
        nutrients.ashwagandha = Math.max(nutrients.ashwagandha, 600);
        nutrients.magnesium *= 1.3;
    }

    if (exerciseFrequency >= 5) {
        nutrients.omega3 *= 1.3;
        nutrients.vitaminE *= 1.3;
        nutrients.coq10 *= 1.3;
    }

    if (sleepQuality <= 4) {
        nutrients.magnesium *= 1.5;
        nutrients.melatonin = 3; // mg
        nutrients.glycine = 3000; // mg
    }

    if (dietQuality <= 5) {
        // Increase all base nutrients if diet is poor
        Object.keys(nutrients).forEach(key => {
            nutrients[key] *= 1.2;
        });
    }

    // Round all values to 2 decimal places
    Object.keys(nutrients).forEach(key => {
        nutrients[key] = Math.round(nutrients[key] * 100) / 100;
    });

    return nutrients;
}

/**
 * Format data for CSV export
 */
function formatForCSV(questionnaireData, nutrients) {
    return {
        timestamp: new Date().toISOString(),
        orderId: questionnaireData.orderId || '',
        fullName: questionnaireData.fullName,
        email: questionnaireData.email || questionnaireData.orderEmail,
        age: questionnaireData.age,
        gender: questionnaireData.gender,
        height: questionnaireData.height,
        weight: questionnaireData.weight,
        selectedAreas: Array.isArray(questionnaireData.selectedAreas)
            ? questionnaireData.selectedAreas.join(';')
            : questionnaireData.selectedAreas,
        sleepQuality: questionnaireData.sleepQuality,
        sleepHours: questionnaireData.sleepHours,
        stressLevel: questionnaireData.stressLevel,
        exerciseFrequency: questionnaireData.exerciseFrequency,
        smoking: questionnaireData.smoking,
        alcoholConsumption: questionnaireData.alcoholConsumption,
        dietQuality: questionnaireData.dietQuality,
        dietType: questionnaireData.dietType,
        supplements: questionnaireData.supplements,
        supplementDetails: questionnaireData.supplementDetails || '',

        // Nutrient concentrations
        ...nutrients,

        // Store full data as JSON for reference
        fullDataJson: JSON.stringify(questionnaireData)
    };
}

/**
 * Save data to CSV file
 */
async function saveToCSV(formattedData) {
    try {
        // Check if file exists
        let fileExists = false;
        try {
            await fs.access(CONFIG.csvPath);
            fileExists = true;
        } catch (error) {
            fileExists = false;
        }

        // Get all keys from formattedData for headers
        const headers = Object.keys(formattedData).map(key => ({
            id: key,
            title: key
        }));

        const csvWriter = createCsvWriter({
            path: CONFIG.csvPath,
            header: headers,
            append: fileExists
        });

        await csvWriter.writeRecords([formattedData]);
        console.log('Data saved to CSV successfully');

        return true;
    } catch (error) {
        console.error('Error saving to CSV:', error);
        throw error;
    }
}

/**
 * Send data to partner API for bottling
 */
async function sendToPartnerAPI(questionnaireData, nutrients) {
    try {
        const payload = {
            orderId: questionnaireData.orderId,
            customerName: questionnaireData.fullName,
            customerEmail: questionnaireData.email || questionnaireData.orderEmail,
            nutrients: nutrients,
            timestamp: new Date().toISOString()
        };

        // This is a placeholder - actual API integration to be provided by client
        console.log('Would send to partner API:', payload);

        // Uncomment when actual API endpoint is provided:
        /*
        const response = await axios.post(CONFIG.partnerApi.endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${CONFIG.partnerApi.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
        */

        return { success: true, message: 'API integration pending' };
    } catch (error) {
        console.error('Error sending to partner API:', error);
        throw error;
    }
}

/**
 * API endpoint to receive questionnaire submissions
 */
app.post('/apps/personalized-questionnaire/submit', async (req, res) => {
    try {
        const questionnaireData = req.body;

        // Validate required fields
        if (!questionnaireData.fullName || !questionnaireData.age) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Calculate nutrient concentrations
        const nutrients = calculateNutrientConcentrations(questionnaireData);

        // Format data for storage
        const formattedData = formatForCSV(questionnaireData, nutrients);

        // Save to CSV
        await saveToCSV(formattedData);

        // Send to partner API (async, don't wait)
        sendToPartnerAPI(questionnaireData, nutrients).catch(error => {
            console.error('Partner API error (non-blocking):', error);
        });

        // Return success response
        res.json({
            success: true,
            message: 'Questionnaire submitted successfully',
            nutrients: nutrients
        });

    } catch (error) {
        console.error('Error processing questionnaire:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * API endpoint to manually trigger email with CSV
 */
app.post('/apps/personalized-questionnaire/send-email', async (req, res) => {
    try {
        await sendDailyEmail();
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * API endpoint to download CSV
 */
app.get('/apps/personalized-questionnaire/download-csv', async (req, res) => {
    try {
        const csvContent = await fs.readFile(CONFIG.csvPath, 'utf-8');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="questionnaire-responses-${Date.now()}.csv"`);
        res.send(csvContent);
    } catch (error) {
        console.error('Error downloading CSV:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Send daily email with CSV attachment
 */
async function sendDailyEmail() {
    try {
        // Check if CSV file exists and has data
        const csvContent = await fs.readFile(CONFIG.csvPath, 'utf-8');
        const lines = csvContent.split('\n').filter(line => line.trim());

        if (lines.length <= 1) {
            console.log('No new data to send');
            return;
        }

        // Create transporter
        const transporter = nodemailer.createTransport(CONFIG.email);

        // Email content
        const mailOptions = {
            from: CONFIG.email.auth.user,
            to: CONFIG.email.targetEmail,
            subject: `Bio-Eta Essenza - Tägliche Fragebogen-Auswertung ${new Date().toLocaleDateString('de-DE')}`,
            html: `
                <h2>Tägliche Fragebogen-Auswertung</h2>
                <p>Anbei finden Sie die gesammelten Fragebogen-Antworten vom ${new Date().toLocaleDateString('de-DE')}.</p>
                <p>Anzahl der Einträge: ${lines.length - 1}</p>
                <p>Die Datei enthält alle Kundenantworten und berechneten Nährstoffkonzentrationen.</p>
                <br>
                <p>Mit freundlichen Grüßen<br>Ihr automatisches Auswertungssystem</p>
            `,
            attachments: [
                {
                    filename: `fragebogen-${new Date().toISOString().split('T')[0]}.csv`,
                    content: csvContent
                }
            ]
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);

        // Archive the CSV file (optional)
        const archivePath = path.join(CONFIG.dataDir, `archive-${Date.now()}.csv`);
        await fs.copyFile(CONFIG.csvPath, archivePath);
        console.log('CSV archived to:', archivePath);

        return info;
    } catch (error) {
        console.error('Error sending daily email:', error);
        throw error;
    }
}

/**
 * Schedule daily email at 9 AM
 * Cron format: minute hour day month weekday
 * '0 9 * * *' means: at 9:00 AM every day
 */
cron.schedule('0 9 * * *', () => {
    console.log('Running scheduled daily email...');
    sendDailyEmail().catch(error => {
        console.error('Scheduled email error:', error);
    });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Personalized Questionnaire API',
        version: '1.0.0',
        endpoints: {
            submit: 'POST /apps/personalized-questionnaire/submit',
            sendEmail: 'POST /apps/personalized-questionnaire/send-email',
            downloadCsv: 'GET /apps/personalized-questionnaire/download-csv',
            health: 'GET /health'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Personalized Questionnaire API running on port ${PORT}`);
    console.log(`Daily email scheduled for 9:00 AM`);
    console.log(`Data directory: ${CONFIG.dataDir}`);
    console.log(`CSV path: ${CONFIG.csvPath}`);
});

module.exports = app;
