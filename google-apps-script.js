/**
 * Google Apps Script für Bio-Eta Essenza Personalized Questionnaire
 *
 * Dieses Script:
 * 1. Empfängt Fragebogen-Daten von Shopify
 * 2. Speichert Daten in Google Sheets
 * 3. Sendet tägliche Email-Reports
 * 4. Bietet CSV-Export
 *
 * SETUP-ANLEITUNG:
 * 1. Öffne https://script.google.com
 * 2. Neues Projekt erstellen
 * 3. Diesen Code einfügen
 * 4. KONFIGURATION unten anpassen
 * 5. Deploy as Web App
 * 6. URL kopieren und in Shopify-Seite einfügen
 */

// ============================================================
// KONFIGURATION - HIER ANPASSEN
// ============================================================

const CONFIG = {
    // Email-Empfänger für tägliche Berichte
    EMAIL_RECIPIENT: 'gina.pommerenke@biovariance.com',

    // Name des Google Sheets (wird automatisch erstellt, falls nicht vorhanden)
    SPREADSHEET_NAME: 'Bio-Eta Essenza - Personalisierte Bestellungen',

    // Zeitzone für Timestamps
    TIMEZONE: 'Europe/Berlin',

    // Tägliche Email-Zeit (24-Stunden-Format)
    DAILY_EMAIL_HOUR: 9  // 9:00 Uhr morgens
};

// ============================================================
// MAIN FUNCTIONS
// ============================================================

/**
 * Handle POST requests from Shopify questionnaire
 */
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        // Get or create spreadsheet
        const sheet = getOrCreateSheet();

        // Save data to sheet
        saveToSheet(sheet, data);

        // Send confirmation email to customer
        sendCustomerConfirmation(data);

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Data saved successfully'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        Logger.log('Error in doPost: ' + error.toString());
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
    return ContentService.createTextOutput(JSON.stringify({
        status: 'active',
        message: 'Bio-Eta Essenza Questionnaire API',
        timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get or create the Google Sheet
 */
function getOrCreateSheet() {
    let spreadsheet;

    // Try to find existing spreadsheet
    const files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);

    if (files.hasNext()) {
        spreadsheet = SpreadsheetApp.open(files.next());
    } else {
        // Create new spreadsheet
        spreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);

        // Setup headers
        const sheet = spreadsheet.getActiveSheet();
        setupHeaders(sheet);
    }

    return spreadsheet.getActiveSheet();
}

/**
 * Setup column headers
 */
function setupHeaders(sheet) {
    const headers = [
        'Timestamp',
        'Order ID',
        'Full Name',
        'Email',
        'Age',
        'Gender',
        'Height (cm)',
        'Weight (kg)',
        'BMI',
        'Selected Areas',
        'Sleep Quality',
        'Sleep Hours',
        'Stress Level',
        'Exercise Frequency',
        'Smoking',
        'Alcohol Consumption',
        'Diet Quality',
        'Diet Type',
        'Supplements',
        'Supplement Details',
        'Subscription Months',
        // Nutrients
        'Vitamin D (IU)',
        'Vitamin B12 (mcg)',
        'Omega-3 (mg)',
        'Magnesium (mg)',
        'Zinc (mg)',
        'Vitamin C (mg)',
        'Vitamin E (IU)',
        'CoQ10 (mg)',
        'NMN (mg)',
        'Resveratrol (mg)',
        'PQQ (mg)',
        'Alpha-Lipoic Acid (mg)',
        'Curcumin (mg)',
        'Ashwagandha (mg)',
        'Rhodiola (mg)',
        'Collagen (mg)',
        'Glucosamine (mg)',
        'Chondroitin (mg)',
        'Biotin (mcg)',
        'Hyaluronic Acid (mg)',
        'Quercetin (mg)',
        'Probiotics (CFU)',
        'Full Data (JSON)'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
}

/**
 * Save data to sheet
 */
function saveToSheet(sheet, data) {
    const nutrients = data.nutrients || {};

    const row = [
        new Date(data.submittedAt),
        data.orderId || '',
        data.fullName || '',
        data.email || '',
        data.age || '',
        data.gender || '',
        data.height || '',
        data.weight || '',
        data.bmi || '',
        Array.isArray(data.selectedAreas) ? data.selectedAreas.join('; ') : data.selectedAreas,
        data.sleepQuality || '',
        data.sleepHours || '',
        data.stressLevel || '',
        data.exerciseFrequency || '',
        data.smoking || '',
        data.alcoholConsumption || '',
        data.dietQuality || '',
        data.dietType || '',
        data.supplements || '',
        data.supplementDetails || '',
        data.subscriptionMonths || '',
        // Nutrients
        nutrients.vitaminD || 0,
        nutrients.vitaminB12 || 0,
        nutrients.omega3 || 0,
        nutrients.magnesium || 0,
        nutrients.zinc || 0,
        nutrients.vitaminC || 0,
        nutrients.vitaminE || 0,
        nutrients.coq10 || 0,
        nutrients.nmn || 0,
        nutrients.resveratrol || 0,
        nutrients.pqq || 0,
        nutrients.alphaLipoicAcid || 0,
        nutrients.curcumin || 0,
        nutrients.ashwagandha || 0,
        nutrients.rhodiola || 0,
        nutrients.collagen || 0,
        nutrients.glucosamine || 0,
        nutrients.chondroitin || 0,
        nutrients.biotin || 0,
        nutrients.hyaluronicAcid || 0,
        nutrients.quercetin || 0,
        nutrients.probiotics || 0,
        JSON.stringify(data)
    ];

    sheet.appendRow(row);
}

/**
 * Send confirmation email to customer
 */
function sendCustomerConfirmation(data) {
    const subject = 'Bestätigung: Bio-Eta Essenza Personalisierungsfragebogen';

    const htmlBody = `
        <h2>Vielen Dank für Ihre Angaben!</h2>

        <p>Liebe/r ${data.fullName},</p>

        <p>wir haben Ihren Personalisierungsfragebogen erfolgreich erhalten und werden nun Ihre individuelle Bio-Eta Essenza Mischung zusammenstellen.</p>

        <h3>Ihre ausgewählten Schwerpunktbereiche:</h3>
        <ul>
            ${formatSelectedAreas(data.selectedAreas)}
        </ul>

        <p>Basierend auf Ihren Angaben werden wir eine maßgeschneiderte Nährstoffkombination für Sie berechnen.</p>

        <p>Sie erhalten in Kürze weitere Informationen zu Ihrer Bestellung.</p>

        <br>
        <p>Mit herzlichen Grüßen,<br>
        Ihr Bio-Eta Essenza Team</p>

        <hr>
        <p style="font-size: 0.9em; color: #666;">
            <strong>Order ID:</strong> ${data.orderId || 'N/A'}<br>
            <strong>Eingereicht am:</strong> ${formatDate(data.submittedAt)}
        </p>
    `;

    try {
        MailApp.sendEmail({
            to: data.email,
            subject: subject,
            htmlBody: htmlBody
        });
    } catch (error) {
        Logger.log('Error sending customer confirmation: ' + error.toString());
    }
}

/**
 * Format selected areas for email
 */
function formatSelectedAreas(areas) {
    const areaNames = {
        energy: 'Energie & Vitalität',
        cognition: 'Kognitive Funktion',
        recovery: 'Regeneration',
        immunity: 'Immunsystem',
        stress: 'Stressresilienz',
        skin: 'Haut & Haare',
        joints: 'Gelenke & Knochen'
    };

    const areasArray = Array.isArray(areas) ? areas : (areas || '').split(',');

    return areasArray.map(area => `<li>${areaNames[area.trim()] || area}</li>`).join('');
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return Utilities.formatDate(date, CONFIG.TIMEZONE, 'dd.MM.yyyy HH:mm');
}

// ============================================================
// DAILY EMAIL REPORTS
// ============================================================

/**
 * Send daily email report
 * Setup: Triggers → Add Trigger → sendDailyReport → Time-based → Day timer → Choose time
 */
function sendDailyReport() {
    try {
        const sheet = getOrCreateSheet();
        const lastRow = sheet.getLastRow();

        if (lastRow <= 1) {
            Logger.log('No new data to report');
            return;
        }

        // Get yesterday's data
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

        // Filter data from last 24 hours
        const recentData = data.filter(row => {
            const timestamp = new Date(row[0]);
            return timestamp >= yesterday && timestamp < today;
        });

        if (recentData.length === 0) {
            Logger.log('No data from last 24 hours');
            return;
        }

        // Create and send report
        sendAdminReport(recentData, sheet);

    } catch (error) {
        Logger.log('Error in sendDailyReport: ' + error.toString());
    }
}

/**
 * Send admin report email
 */
function sendAdminReport(recentData, sheet) {
    const subject = `Bio-Eta Essenza - Täglicher Fragebogen-Report (${new Date().toLocaleDateString('de-DE')})`;

    const htmlBody = `
        <h2>Täglicher Fragebogen-Report</h2>

        <p><strong>Datum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
        <p><strong>Neue Einträge:</strong> ${recentData.length}</p>

        <h3>Zusammenfassung:</h3>
        ${generateSummaryTable(recentData)}

        <hr>

        <p>Die vollständigen Daten finden Sie im Google Sheet:</p>
        <p><a href="${sheet.getParent().getUrl()}">${CONFIG.SPREADSHEET_NAME}</a></p>

        <p>Ein CSV-Export ist als Anhang beigefügt.</p>

        <br>
        <p>Automatisch generiert von Bio-Eta Essenza Questionnaire System</p>
    `;

    // Create CSV attachment
    const csvContent = createCSV(recentData);
    const csvBlob = Utilities.newBlob(csvContent, 'text/csv', `fragebogen-${new Date().toISOString().split('T')[0]}.csv`);

    try {
        MailApp.sendEmail({
            to: CONFIG.EMAIL_RECIPIENT,
            subject: subject,
            htmlBody: htmlBody,
            attachments: [csvBlob]
        });

        Logger.log('Daily report sent successfully');
    } catch (error) {
        Logger.log('Error sending daily report: ' + error.toString());
    }
}

/**
 * Generate summary table HTML
 */
function generateSummaryTable(data) {
    let html = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">';
    html += '<tr style="background-color: #4CAF50; color: white;">';
    html += '<th>Zeit</th><th>Name</th><th>Email</th><th>Schwerpunkte</th><th>Abo</th>';
    html += '</tr>';

    data.forEach(row => {
        html += '<tr>';
        html += `<td>${formatDate(row[0])}</td>`;
        html += `<td>${row[2]}</td>`;  // Name
        html += `<td>${row[3]}</td>`;  // Email
        html += `<td>${row[9]}</td>`;  // Selected Areas
        html += `<td>${row[20] || 'N/A'} Monate</td>`;  // Subscription
        html += '</tr>';
    });

    html += '</table>';

    return html;
}

/**
 * Create CSV content
 */
function createCSV(data) {
    const sheet = getOrCreateSheet();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    let csv = headers.join(',') + '\n';

    data.forEach(row => {
        const rowData = row.map(cell => {
            // Escape commas and quotes
            let value = cell.toString();
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        csv += rowData.join(',') + '\n';
    });

    return csv;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Test function - run this to test the setup
 */
function testSetup() {
    const testData = {
        submittedAt: new Date().toISOString(),
        orderId: 'TEST-12345',
        fullName: 'Test User',
        email: 'test@example.com',
        age: 35,
        gender: 'male',
        height: 180,
        weight: 80,
        bmi: 24.69,
        selectedAreas: ['energy', 'cognition'],
        sleepQuality: 7,
        sleepHours: 7.5,
        stressLevel: 5,
        exerciseFrequency: 3,
        smoking: 'no',
        alcoholConsumption: 2,
        dietQuality: 7,
        dietType: 'omnivore',
        supplements: 'no',
        supplementDetails: '',
        subscriptionMonths: 3,
        nutrients: {
            vitaminD: 3000,
            vitaminB12: 750,
            omega3: 1500,
            magnesium: 390,
            zinc: 19.5
        }
    };

    try {
        const sheet = getOrCreateSheet();
        saveToSheet(sheet, testData);
        sendCustomerConfirmation(testData);

        Logger.log('Test successful! Check your Google Sheet and email.');
        return 'Success';
    } catch (error) {
        Logger.log('Test failed: ' + error.toString());
        return 'Error: ' + error.toString();
    }
}

/**
 * Manual trigger for daily report (for testing)
 */
function testDailyReport() {
    sendDailyReport();
}

/**
 * Get spreadsheet URL
 */
function getSpreadsheetUrl() {
    const sheet = getOrCreateSheet();
    Logger.log('Spreadsheet URL: ' + sheet.getParent().getUrl());
    return sheet.getParent().getUrl();
}

/**
 * Count total submissions
 */
function getTotalSubmissions() {
    const sheet = getOrCreateSheet();
    const count = sheet.getLastRow() - 1;  // Subtract header row
    Logger.log('Total submissions: ' + count);
    return count;
}
