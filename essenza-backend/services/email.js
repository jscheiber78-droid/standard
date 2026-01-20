/**
 * ESSENZA Email Service
 * Handles sending confirmation and notification emails
 */

const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        if (config.email.host && config.email.user) {
            this.transporter = nodemailer.createTransport({
                host: config.email.host,
                port: config.email.port,
                secure: config.email.port === 465,
                auth: {
                    user: config.email.user,
                    pass: config.email.pass,
                },
            });
        } else {
            console.warn('Email service not configured - emails will be logged only');
        }
    }

    /**
     * Send email
     */
    async sendEmail(to, subject, html, text = null) {
        const mailOptions = {
            from: `"${config.email.fromName}" <${config.email.from}>`,
            to,
            subject,
            html,
            text: text || this.stripHtml(html),
        };

        if (!this.transporter) {
            console.log('Email (not sent - no transporter):', mailOptions);
            return { success: true, simulated: true };
        }

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Strip HTML tags for plain text version
     */
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    /**
     * Send questionnaire confirmation email to customer
     */
    async sendConfirmationEmail(questionnaire) {
        const { personal, kategorien, submissionId } = questionnaire;

        const categoryNames = {
            'mentale_gesundheit': 'Mentale Gesundheit',
            'fitness': 'Fitness',
            'stress_schlaf': 'Stress und Schlaf',
            'verdauung': 'Verdauung',
            'immunsystem': 'Immunsystem',
            'haut_haare': 'Haut, Haare, Nägel und Augen',
            'knochen_gelenke': 'Knochen, Gelenke und Muskeln',
        };

        const selectedCategoryNames = kategorien.map(k => categoryNames[k] || k).join(', ');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #2C3E2C; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2D5A27, #4A7C43); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { font-size: 14px; letter-spacing: 3px; opacity: 0.9; }
        .product-name { font-size: 32px; font-weight: bold; margin: 10px 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #D4E0D4; border-top: none; }
        .greeting { font-size: 18px; color: #2D5A27; margin-bottom: 20px; }
        .info-box { background: #F7FAF7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-label { font-weight: bold; color: #2D5A27; }
        .categories { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .category-tag { background: #8FB573; color: white; padding: 5px 12px; border-radius: 15px; font-size: 13px; }
        .footer { background: #F7FAF7; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #D4E0D4; border-top: none; }
        .footer p { margin: 5px 0; font-size: 13px; color: #5A6B5A; }
        .footer a { color: #2D5A27; }
        .cta-button { display: inline-block; background: #C9A227; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BIO-ETA</div>
            <div class="product-name">Essenza</div>
        </div>
        <div class="content">
            <p class="greeting">Hallo ${personal.vorname},</p>

            <p>vielen Dank für das Ausfüllen deines Essenza-Fragebogens! Wir haben deine Angaben erhalten und werden nun deine personalisierte Essenza zusammenstellen.</p>

            <div class="info-box">
                <p><span class="info-label">Deine Referenznummer:</span><br>${submissionId}</p>
                <p><span class="info-label">Deine Fokus-Bereiche:</span></p>
                <div class="categories">
                    ${kategorien.map(k => `<span class="category-tag">${categoryNames[k] || k}</span>`).join('')}
                </div>
            </div>

            <p><strong>Was passiert als nächstes?</strong></p>
            <ol>
                <li>Unser Experten-Team analysiert deine Angaben</li>
                <li>Wir stellen deine individuelle Essenza zusammen</li>
                <li>Du erhältst eine Benachrichtigung, sobald dein Produkt bereit ist</li>
            </ol>

            <p>Bei Fragen zu deiner Bestellung kannst du dich jederzeit an uns wenden.</p>

            <center>
                <a href="mailto:info@bio-eta.de" class="cta-button">Kontakt aufnehmen</a>
            </center>
        </div>
        <div class="footer">
            <p><strong>Bio-eta GmbH</strong></p>
            <p>E-Mail: <a href="mailto:info@bio-eta.de">info@bio-eta.de</a></p>
            <p style="margin-top: 15px; font-size: 11px;">Diese E-Mail wurde automatisch generiert. Bitte antworte nicht direkt auf diese Nachricht.</p>
        </div>
    </div>
</body>
</html>
        `;

        return this.sendEmail(
            personal.email,
            'Dein Essenza Fragebogen wurde erfolgreich übermittelt',
            html
        );
    }

    /**
     * Send notification email to admin
     */
    async sendAdminNotification(questionnaire) {
        const { personal, kategorien, submissionId } = questionnaire;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #2D5A27; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #F7FAF7; color: #2D5A27; }
        .categories { color: #4A7C43; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Neuer Essenza Fragebogen</h1>

        <p>Ein neuer Fragebogen wurde eingereicht:</p>

        <table>
            <tr><th>Referenznummer</th><td>${submissionId}</td></tr>
            <tr><th>Name</th><td>${personal.vorname} ${personal.nachname}</td></tr>
            <tr><th>E-Mail</th><td>${personal.email}</td></tr>
            <tr><th>Geschlecht</th><td>${personal.geschlecht}</td></tr>
            <tr><th>Größe / Gewicht</th><td>${personal.groesse} cm / ${personal.gewicht} kg</td></tr>
            <tr><th>Aktivitätslevel</th><td>${personal.aktivitaet}/10</td></tr>
            <tr><th>Kategorien</th><td class="categories">${kategorien.join(', ')}</td></tr>
        </table>

        <p>Bitte überprüfe die vollständigen Daten im Admin-Panel.</p>
    </div>
</body>
</html>
        `;

        const adminEmail = config.email.from; // Or use a specific admin email

        return this.sendEmail(
            adminEmail,
            `[Essenza] Neuer Fragebogen von ${personal.vorname} ${personal.nachname}`,
            html
        );
    }
}

module.exports = new EmailService();
