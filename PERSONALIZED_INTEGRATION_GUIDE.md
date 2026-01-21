# Bio-Eta Essenza - Personalisiertes Bestellsystem - Integrationsleitfaden

Vollständige Anleitung zur Integration des personalisierten Fragebogen-Systems für Shopify.

## 📋 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [System-Architektur](#system-architektur)
3. [Shopify Integration](#shopify-integration)
4. [API-Server Setup](#api-server-setup)
5. [Fragebogen-Konfiguration](#fragebogen-konfiguration)
6. [Datenverarbeitung](#datenverarbeitung)
7. [Email-Automation](#email-automation)
8. [Partner-API Integration](#partner-api-integration)
9. [Testen](#testen)
10. [Deployment](#deployment)
11. [Wartung & Support](#wartung--support)

---

## 🎯 Überblick

Dieses System ermöglicht es Kunden, nach dem Kauf von "Bio-Eta Essenza" Produkten einen personalisierten Fragebogen auszufüllen. Basierend auf den Antworten werden individuelle Nährstoffkonzentrationen berechnet und an Ihren Abfüllpartner übermittelt.

### Hauptfunktionen

- ✅ Automatische Weiterleitung nach Bestellabschluss
- ✅ Dynamischer Fragebogen mit bedingten Fragen
- ✅ 7 Problembereichs-Kategorien
- ✅ Automatische Berechnung der Nährstoffkonzentrationen
- ✅ CSV-Export für CRM-Integration
- ✅ Tägliche Email-Berichte
- ✅ Partner-API Integration für Abfüllung

### Bestelloptionen

Kunden können zwischen 3 Abo-Laufzeiten wählen:
- 1 Monat
- 3 Monate
- 6 Monate

---

## 🏗️ System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Shopify Store                         │
│                                                              │
│  ┌──────────────┐        ┌─────────────────┐               │
│  │   Produkt:   │  →→→   │  Bestellung     │               │
│  │  Personalized│        │  abgeschlossen  │               │
│  └──────────────┘        └─────────────────┘               │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    ↓
                          ┌──────────────────┐
                          │  Order           │
                          │  Confirmation    │
                          │  Redirect        │
                          └──────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────┐
│              Personalized Questionnaire Page                 │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  General   │→→│  Problem   │→→│  Lifestyle │           │
│  │  Questions │  │   Areas    │  │  Questions │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  ┌────────────────────────────────────────────┐            │
│  │  Dynamic Questions (based on selections)   │            │
│  └────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                                    ↓
                          ┌──────────────────┐
                          │   Form Submit    │
                          └──────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────┐
│                     API Handler (Node.js)                    │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  1. Calculate Nutrient Concentrations          │         │
│  └────────────────────────────────────────────────┘         │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────┐         │
│  │  2. Save to CSV File                           │         │
│  └────────────────────────────────────────────────┘         │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────┐         │
│  │  3. Send to Partner API (Bottling)             │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                                    ↓
                    ┌──────────────────────────┐
                    │  Daily Email (9 AM)      │
                    │  with CSV Attachment     │
                    └──────────────────────────┘
```

---

## 🛍️ Shopify Integration

### Schritt 1: Produktvarianten einrichten

1. Gehe zu **Shopify Admin → Produkte**
2. Öffne oder erstelle das Produkt "Bio-Eta Essenza / Personalized"
3. Füge folgende Varianten hinzu:
   - **1 Monat** - Preis: [Ihr Preis]
   - **3 Monate** - Preis: [Ihr Preis]
   - **6 Monate** - Preis: [Ihr Preis]

### Schritt 2: Fragebogen-Seite erstellen

1. Gehe zu **Shopify Admin → Online Store → Pages**
2. Klicke **Add page**
3. Titel: `Personalized Questionnaire` oder `Personalisierungsfragebogen`
4. URL-Handle: `personalized-questionnaire` (wichtig!)
5. Klicke auf **Show HTML** (`<>` Button)
6. Kopiere den gesamten Inhalt aus `personalized-questionnaire.html`
7. Füge ihn ein und klicke **Save**

**Wichtig:** Die URL muss `/pages/personalized-questionnaire` sein!

### Schritt 3: Order Confirmation Redirect einrichten

#### Option A: Additional Scripts (Shopify Plus)

1. Gehe zu **Settings → Checkout**
2. Scrolle zu **Order status page** → **Additional scripts**
3. Kopiere den Inhalt aus `order-confirmation-redirect.liquid`
4. Füge ihn ein und speichere

#### Option B: Theme anpassen (alle Shopify-Pläne)

1. Gehe zu **Online Store → Themes → Actions → Edit code**
2. Öffne `Templates → checkout.liquid` oder `Sections → checkout-footer.liquid`
3. Füge den Code aus `order-confirmation-redirect.liquid` am Ende ein
4. Speichere

#### Option C: Thank You Page App

Wenn keine der obigen Optionen verfügbar ist, verwende eine App wie:
- "Order Confirmation Upsell"
- "Checkout Plus"
- "Custom Thank You Page"

### Schritt 4: Produkt-Erkennung anpassen

Im `order-confirmation-redirect.liquid` Code, passe die Zeile an:

```liquid
{% if line_item.product.title contains 'Bio-Eta Essenza' or line_item.product.title contains 'Personalized' %}
```

Ersetze `'Bio-Eta Essenza'` mit dem exakten Namen Ihres Produkts.

**Alternative:** Verwende Product Tags:

```liquid
{% if line_item.product.tags contains 'personalized-questionnaire' %}
```

Dann füge den Tag `personalized-questionnaire` zu Ihrem Produkt hinzu.

---

## 🖥️ API-Server Setup

### Voraussetzungen

- Node.js 14+ installiert
- npm oder yarn
- Server oder Hosting (z.B. Heroku, DigitalOcean, AWS)

### Installation

1. **Dateien auf Server hochladen**

```bash
# Erstelle ein neues Verzeichnis
mkdir personalized-api
cd personalized-api

# Kopiere die Dateien
# - api-handler.js
# - package.json
# - .env.example
```

2. **Umgebungsvariablen konfigurieren**

```bash
# Kopiere .env.example zu .env
cp .env.example .env

# Bearbeite .env mit deinen Werten
nano .env
```

Wichtige Einstellungen in `.env`:

```env
PORT=3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ihre-email@gmail.com
EMAIL_PASS=ihr-app-passwort
TARGET_EMAIL=gina.pommerenke@biovariance.com
```

3. **Dependencies installieren**

```bash
npm install
```

4. **Server starten**

```bash
# Produktion
npm start

# Entwicklung (mit Auto-Reload)
npm run dev
```

5. **Verifizieren**

Öffne `http://ihr-server:3000/health` im Browser.

Erwartete Antwort:
```json
{
  "status": "ok",
  "timestamp": "2026-01-21T..."
}
```

### Email-Konfiguration

#### Gmail verwenden

1. Gehe zu **Google Account → Security**
2. Aktiviere **2-Step Verification**
3. Generiere ein **App Password**:
   - Gehe zu Security → App Passwords
   - Wähle "Mail" und "Other"
   - Kopiere das generierte Passwort
4. Verwende dieses Passwort in `.env`:

```env
EMAIL_USER=ihre-email@gmail.com
EMAIL_PASS=das-app-passwort-hier
```

#### Alternative: SendGrid

SendGrid bietet bessere Zustellbarkeit für automatisierte Emails.

1. Erstelle einen Account auf sendgrid.com
2. Generiere einen API Key
3. Installiere SendGrid SDK:

```bash
npm install @sendgrid/mail
```

4. Aktualisiere `api-handler.js` (SendGrid-Integration ist vorbereitet)

### Server als Daemon laufen lassen

#### Mit PM2 (empfohlen)

```bash
# PM2 installieren
npm install -g pm2

# Server mit PM2 starten
pm2 start api-handler.js --name personalized-api

# Auto-start nach Reboot
pm2 startup
pm2 save

# Status prüfen
pm2 status

# Logs ansehen
pm2 logs personalized-api
```

---

## 📝 Fragebogen-Konfiguration

### Problembereichs-Fragen anpassen

In `personalized-questionnaire.html`, Zeile ~520-650, findest du:

```javascript
const PROBLEM_AREA_QUESTIONS = {
    energy: [
        {
            id: 'energy_fatigue',
            label: 'Fühlen Sie sich häufig müde oder energielos?',
            type: 'yesno'
        },
        // Weitere Fragen...
    ],
    // Weitere Bereiche...
};
```

#### Fragetypen

1. **Yes/No Fragen**
```javascript
{
    id: 'unique_id',
    label: 'Ihre Frage?',
    type: 'yesno'
}
```

2. **Skala 1-10**
```javascript
{
    id: 'unique_id',
    label: 'Ihre Frage? (1 = niedrig, 10 = hoch)',
    type: 'scale'
}
```

3. **Textfeld**
```javascript
{
    id: 'unique_id',
    label: 'Ihre Frage?',
    type: 'text'
}
```

### Neue Problembereiche hinzufügen

1. **Fragebogen-HTML aktualisieren** (Zeile ~280)

```html
<div class="problem-area-card" data-area="neuer-bereich">
    <div class="problem-area-icon">🎯</div>
    <div class="problem-area-title">Neuer Bereich</div>
</div>
```

2. **Fragen definieren** (JavaScript)

```javascript
const PROBLEM_AREA_QUESTIONS = {
    // Bestehende Bereiche...
    'neuer-bereich': [
        {
            id: 'neuer_bereich_frage1',
            label: 'Erste Frage zum neuen Bereich?',
            type: 'yesno'
        },
        // Weitere Fragen...
    ]
};
```

3. **Bereichsname hinzufügen** (Zeile ~630)

```javascript
const areaNames = {
    // Bestehende...
    'neuer-bereich': 'Neuer Bereich Titel'
};
```

---

## 🧮 Datenverarbeitung

### Nährstoffberechnung anpassen

Die Berechnung erfolgt in `api-handler.js`, Funktion `calculateNutrientConcentrations()` (Zeile 69).

#### Eigene Berechnungslogik integrieren

**Option 1: Erweitern der bestehenden Logik**

```javascript
function calculateNutrientConcentrations(questionnaireData) {
    // Bestehende Logik...

    // Ihre spezifische Logik hinzufügen
    if (questionnaireData.specificCondition) {
        nutrients.customNutrient = calculateCustomValue(questionnaireData);
    }

    return nutrients;
}
```

**Option 2: Externe Berechnung importieren**

Wenn Sie eigenen Code vom Entwickler erhalten:

```javascript
// Am Anfang der Datei
const { calculateNutrientsExternal } = require('./nutrient-calculation');

function calculateNutrientConcentrations(questionnaireData) {
    // Verwende externe Berechnung
    return calculateNutrientsExternal(questionnaireData);
}
```

**Option 3: Test-Daten zur Validierung**

Fügen Sie Testfälle hinzu:

```javascript
// test-calculation.js
const testCases = [
    {
        input: {
            age: 35,
            gender: 'male',
            selectedAreas: ['energy', 'cognition'],
            // ... weitere Werte
        },
        expectedOutput: {
            vitaminD: 3000,
            omega3: 1500,
            // ... erwartete Konzentrationen
        }
    }
];
```

### CSV-Format anpassen

Das CSV-Format wird in `formatForCSV()` definiert (Zeile 178):

```javascript
function formatForCSV(questionnaireData, nutrients) {
    return {
        // Basis-Felder
        timestamp: new Date().toISOString(),
        orderId: questionnaireData.orderId || '',
        fullName: questionnaireData.fullName,
        // ...

        // Nährstoffe
        ...nutrients,

        // Custom-Felder hinzufügen
        customField1: questionnaireData.customField1,
        customField2: calculateCustomMetric(questionnaireData)
    };
}
```

### Datenvalidierung

Erweitere die Validierung in der Submit-Funktion:

```javascript
app.post('/apps/personalized-questionnaire/submit', async (req, res) => {
    const questionnaireData = req.body;

    // Erweiterte Validierung
    if (!questionnaireData.fullName || !questionnaireData.age) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }

    // Weitere Validierungen
    if (questionnaireData.age < 18 || questionnaireData.age > 120) {
        return res.status(400).json({
            success: false,
            error: 'Invalid age'
        });
    }

    // ... Rest der Funktion
});
```

---

## 📧 Email-Automation

### Täglicher Email-Versand

Der Cron-Job läuft standardmäßig um 9:00 Uhr morgens.

**Zeitplan ändern:**

In `api-handler.js`, Zeile ~430:

```javascript
// Format: 'Minute Stunde Tag Monat Wochentag'

// Täglich um 9:00 Uhr
cron.schedule('0 9 * * *', sendDailyEmail);

// Täglich um 18:00 Uhr
cron.schedule('0 18 * * *', sendDailyEmail);

// Montag bis Freitag um 9:00 Uhr
cron.schedule('0 9 * * 1-5', sendDailyEmail);

// Zweimal täglich: 9:00 und 17:00 Uhr
cron.schedule('0 9,17 * * *', sendDailyEmail);
```

### Manueller Email-Versand

Via API-Endpoint:

```bash
curl -X POST http://ihr-server:3000/apps/personalized-questionnaire/send-email
```

Via Browser oder Postman:
- URL: `http://ihr-server:3000/apps/personalized-questionnaire/send-email`
- Methode: POST

### Email-Template anpassen

In `api-handler.js`, Funktion `sendDailyEmail()`, Zeile ~360:

```javascript
const mailOptions = {
    from: CONFIG.email.auth.user,
    to: CONFIG.email.targetEmail,
    subject: `Ihr Custom Subject ${new Date().toLocaleDateString('de-DE')}`,
    html: `
        <h2>Ihr Custom Header</h2>
        <p>Ihre Nachricht hier...</p>
        <p>Anzahl der Einträge: ${lines.length - 1}</p>

        <!-- Custom-Statistiken -->
        <h3>Statistiken:</h3>
        <ul>
            <li>Total Submissions: ${lines.length - 1}</li>
            <li>Datum: ${new Date().toLocaleDateString('de-DE')}</li>
        </ul>
    `,
    attachments: [
        {
            filename: `custom-name-${new Date().toISOString().split('T')[0]}.csv`,
            content: csvContent
        }
    ]
};
```

### Mehrere Email-Empfänger

```javascript
const mailOptions = {
    from: CONFIG.email.auth.user,
    to: 'gina.pommerenke@biovariance.com',
    cc: 'weitere-person@firma.de',
    bcc: 'backup@firma.de',
    // ... Rest
};
```

---

## 🔗 Partner-API Integration

### API-Schnittstelle konfigurieren

Die Partner-API-Integration befindet sich in `api-handler.js`, Funktion `sendToPartnerAPI()`.

**Wenn Sie den Code vom Partner erhalten:**

1. **Einfache HTTP POST Integration**

```javascript
async function sendToPartnerAPI(questionnaireData, nutrients) {
    try {
        const payload = {
            orderId: questionnaireData.orderId,
            customerName: questionnaireData.fullName,
            customerEmail: questionnaireData.email,
            nutrients: nutrients,
            // Format wie vom Partner gefordert
        };

        const response = await axios.post(
            CONFIG.partnerApi.endpoint,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${CONFIG.partnerApi.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Partner API Error:', error);
        throw error;
    }
}
```

2. **Custom Integration Code**

Wenn Partner eigenen Code bereitstellt:

```javascript
// partner-integration.js (von Partner bereitgestellt)
const partnerModule = require('./partner-integration');

async function sendToPartnerAPI(questionnaireData, nutrients) {
    return await partnerModule.submitOrder({
        order: questionnaireData.orderId,
        recipe: nutrients,
        customer: {
            name: questionnaireData.fullName,
            email: questionnaireData.email
        }
    });
}
```

3. **SOAP/XML Integration**

Falls Partner SOAP verwendet:

```bash
npm install soap
```

```javascript
const soap = require('soap');

async function sendToPartnerAPI(questionnaireData, nutrients) {
    const url = CONFIG.partnerApi.endpoint;
    const client = await soap.createClientAsync(url);

    const result = await client.submitOrderAsync({
        orderId: questionnaireData.orderId,
        nutrients: nutrients
        // ... weitere Felder
    });

    return result;
}
```

### Fehlerbehandlung & Retry-Logik

```javascript
async function sendToPartnerAPI(questionnaireData, nutrients, retryCount = 0) {
    const MAX_RETRIES = 3;

    try {
        const response = await axios.post(
            CONFIG.partnerApi.endpoint,
            payload,
            { timeout: 10000 }
        );

        return response.data;
    } catch (error) {
        if (retryCount < MAX_RETRIES) {
            console.log(`Retry ${retryCount + 1}/${MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
            return sendToPartnerAPI(questionnaireData, nutrients, retryCount + 1);
        }

        // Speichere fehlgeschlagene Requests für manuellen Retry
        await saveFailed PartnerSubmission(questionnaireData, nutrients, error);
        throw error;
    }
}
```

---

## 🧪 Testen

### 1. Lokaler Test des Fragebogens

1. Öffne `personalized-questionnaire.html` im Browser
2. Fülle den Fragebogen aus
3. Öffne Browser DevTools (F12) → Console
4. Nach Submit: Prüfe die Console auf Ausgaben
5. Prüfe LocalStorage: `localStorage.getItem('personalizedQuestionnaireData')`

### 2. API-Server Test

**Test 1: Health Check**

```bash
curl http://localhost:3000/health
```

**Test 2: Submit Test Data**

```bash
curl -X POST http://localhost:3000/apps/personalized-questionnaire/submit \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "age": 35,
    "gender": "male",
    "height": 180,
    "weight": 80,
    "email": "test@example.com",
    "selectedAreas": ["energy", "cognition"],
    "sleepQuality": 7,
    "stressLevel": 5,
    "exerciseFrequency": 3,
    "dietQuality": 7
  }'
```

**Test 3: CSV Download**

```bash
curl http://localhost:3000/apps/personalized-questionnaire/download-csv -o test.csv
```

**Test 4: Manual Email**

```bash
curl -X POST http://localhost:3000/apps/personalized-questionnaire/send-email
```

### 3. Shopify Integration Test

**Test-Szenario:**

1. Erstelle eine Test-Bestellung in Shopify
   - Verwende "Process order" im Admin
   - Oder "Checkout Test Mode" App

2. Gehe zur Order Confirmation Page
   - Prüfe, ob der Redirect-Banner erscheint
   - Prüfe den Countdown

3. Klicke auf "Zum Fragebogen"
   - URL sollte sein: `/pages/personalized-questionnaire?order_id=...&email=...`

4. Fülle den Fragebogen aus

5. Nach Submit:
   - Prüfe Completion Screen
   - Prüfe Server Logs
   - Prüfe CSV-Datei
   - Prüfe Email (falls konfiguriert)

### 4. Ende-zu-Ende Test Checklist

- [ ] Produkt mit Varianten erstellt (1, 3, 6 Monate)
- [ ] Order Confirmation Redirect funktioniert
- [ ] Fragebogen lädt korrekt
- [ ] Allgemeine Fragen funktionieren
- [ ] Problembereichs-Auswahl funktioniert
- [ ] Dynamische Fragen erscheinen
- [ ] Lifestyle-Fragen funktionieren
- [ ] Submit funktioniert
- [ ] Daten werden gespeichert
- [ ] CSV wird erstellt
- [ ] Email wird versendet
- [ ] Partner-API erhält Daten (wenn konfiguriert)

---

## 🚀 Deployment

### Option 1: Heroku

1. **Heroku CLI installieren**

```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Download von heroku.com
```

2. **Deploy**

```bash
# Login
heroku login

# Erstelle App
heroku create personalized-api

# Environment Variables setzen
heroku config:set EMAIL_USER=ihre-email@gmail.com
heroku config:set EMAIL_PASS=ihr-passwort
heroku config:set TARGET_EMAIL=gina.pommerenke@biovariance.com
# ... weitere Variablen

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku master

# Logs ansehen
heroku logs --tail
```

3. **URL in Shopify aktualisieren**

In `personalized-questionnaire.html`, Zeile ~520:

```javascript
const CONFIG = {
    apiEndpoint: 'https://ihre-app.herokuapp.com/apps/personalized-questionnaire/submit',
    // ...
};
```

### Option 2: DigitalOcean

1. **Droplet erstellen**
   - Ubuntu 20.04 LTS
   - $5-10/month Plan

2. **Server einrichten**

```bash
# SSH verbinden
ssh root@ihre-ip

# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs

# Nginx installieren (als Reverse Proxy)
apt-get install -y nginx

# Code hochladen
scp -r ./personalized-api root@ihre-ip:/var/www/
```

3. **Nginx konfigurieren**

```nginx
# /etc/nginx/sites-available/personalized-api
server {
    listen 80;
    server_name ihre-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **SSL mit Let's Encrypt**

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d ihre-domain.com
```

### Option 3: AWS (EC2 + RDS)

Für Enterprise-Lösung mit Datenbank.

1. **EC2 Instance**
   - t2.micro (Free Tier)
   - Ubuntu Server

2. **RDS Database** (optional)
   - PostgreSQL
   - Für dauerhafte Speicherung statt CSV

3. **S3 Bucket**
   - Für CSV-Backup
   - Für Email-Attachments

4. **CloudWatch**
   - Monitoring
   - Logs

### Domain & SSL

**Shopify Custom Domain:**

Falls Sie eine eigene Domain verwenden:

1. Domain zu Shopify hinzufügen
2. Subdomain für API erstellen:
   - `api.ihre-domain.de` → Zeigt auf Ihren Server
3. SSL-Zertifikat installieren

---

## 🔧 Wartung & Support

### Logs überwachen

**Mit PM2:**

```bash
# Alle Logs
pm2 logs

# Nur Fehler
pm2 logs --err

# Letzte 100 Zeilen
pm2 logs --lines 100
```

**Log-Files:**

Logs werden auch in Dateien gespeichert (wenn konfiguriert):

```bash
# Logs ansehen
tail -f ./logs/api.log

# Fehler suchen
grep ERROR ./logs/api.log
```

### Daten-Backup

**Automatisches Backup:**

Füge in `api-handler.js` hinzu:

```javascript
const cron = require('node-cron');

// Täglich um Mitternacht Backup
cron.schedule('0 0 * * *', async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const backupPath = `./backups/questionnaire-${timestamp}.csv`;

    await fs.copyFile(CONFIG.csvPath, backupPath);
    console.log(`Backup created: ${backupPath}`);
});
```

**Cloud-Backup (AWS S3):**

```bash
npm install aws-sdk
```

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function backupToS3() {
    const fileContent = await fs.readFile(CONFIG.csvPath);

    const params = {
        Bucket: 'your-bucket-name',
        Key: `backups/questionnaire-${Date.now()}.csv`,
        Body: fileContent
    };

    return s3.upload(params).promise();
}
```

### Häufige Probleme

**Problem 1: Email wird nicht gesendet**

Lösung:
```bash
# Prüfe Email-Konfiguration
echo $EMAIL_USER
echo $EMAIL_HOST

# Test Email-Verbindung
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: { user: 'user', pass: 'pass' }
});
transporter.verify().then(console.log).catch(console.error);
"
```

**Problem 2: CSV-Datei wird nicht erstellt**

Lösung:
```bash
# Prüfe Berechtigungen
ls -la ./data/

# Erstelle Verzeichnis manuell
mkdir -p ./data
chmod 755 ./data
```

**Problem 3: Cron-Job läuft nicht**

Lösung:
```bash
# Prüfe ob PM2 läuft
pm2 status

# Restart PM2
pm2 restart personalized-api

# Prüfe Cron-Logs
pm2 logs personalized-api | grep "Running scheduled"
```

**Problem 4: CORS-Fehler**

Wenn Fragebogen auf anderer Domain:

```javascript
// In api-handler.js
const cors = require('cors');

app.use(cors({
    origin: 'https://ihr-shop.myshopify.com',
    credentials: true
}));
```

### Updates & Änderungen

**Neues Nährstoff-Feld hinzufügen:**

1. In `api-handler.js`, Funktion `calculateNutrientConcentrations`:
```javascript
nutrients.neuesNutrient = 100; // Basiswert
```

2. In `formatForCSV`:
```javascript
return {
    // ... bestehende Felder
    neuesNutrient: nutrients.neuesNutrient
};
```

3. Server neu starten:
```bash
pm2 restart personalized-api
```

**Fragebogen-Frage ändern:**

1. Bearbeite `personalized-questionnaire.html`
2. In Shopify: Pages → Personalized Questionnaire
3. HTML-Modus aktivieren
4. Code aktualisieren
5. Speichern

### Monitoring & Alerts

**Uptime Monitoring:**

Kostenlose Services:
- UptimeRobot.com
- Pingdom (Free Tier)
- StatusCake

Konfiguration:
- URL: `https://ihre-domain.com/health`
- Intervall: 5 Minuten
- Alert bei: Down > 2 mal

**Email bei Fehler:**

```javascript
// In api-handler.js
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);

    // Sende Admin-Benachrichtigung
    await sendErrorEmail({
        subject: 'API Error Alert',
        error: error.message,
        stack: error.stack
    });
});
```

### Support-Kontakte

Bei Fragen oder Problemen:

1. **Technische Fragen zur Integration:**
   - Gina Pommerenke: gina.pommerenke@biovariance.com

2. **Shopify-spezifische Probleme:**
   - Shopify Support: help.shopify.com

3. **Server/Hosting-Probleme:**
   - Ihr Hosting-Provider Support

---

## 📊 Anhang

### A. Datenschutz (DSGVO)

Wichtige Punkte für DSGVO-Compliance:

1. **Datenschutzerklärung aktualisieren**
   - Erwähne Fragebogen-Datensammlung
   - Zweck der Datenverarbeitung
   - Speicherdauer
   - Rechte der Betroffenen

2. **Einwilligungserklärung**

Füge in Fragebogen ein:

```html
<div class="consent-checkbox">
    <input type="checkbox" id="dataConsent" required>
    <label for="dataConsent">
        Ich willige ein, dass meine Daten zur Berechnung meiner
        personalisierten Nährstoffmischung verarbeitet werden.
        <a href="/pages/datenschutz" target="_blank">Datenschutzerklärung</a>
    </label>
</div>
```

3. **Daten-Löschung**

Implementiere Löschmechanismus:

```javascript
app.delete('/apps/personalized-questionnaire/data/:email', async (req, res) => {
    // Lösche Daten für bestimmte Email
    // DSGVO Artikel 17: Recht auf Löschung
});
```

### B. CSV-Format Spezifikation

Standard-CSV-Format:

```csv
timestamp,orderId,fullName,email,age,gender,height,weight,selectedAreas,vitaminD,omega3,...
2026-01-21T10:30:00Z,12345,Max Mustermann,max@example.com,35,male,180,80,"energy;cognition",3000,1500,...
```

**Feldtypen:**
- `timestamp`: ISO 8601 DateTime
- `orderId`: String
- `selectedAreas`: Semikolon-getrennt (;)
- Nährstoffe: Zahlen (mg, mcg, IU)

### C. API-Endpoints Übersicht

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/health` | GET | Health Check |
| `/apps/personalized-questionnaire/submit` | POST | Fragebogen einreichen |
| `/apps/personalized-questionnaire/send-email` | POST | Email manuell senden |
| `/apps/personalized-questionnaire/download-csv` | GET | CSV herunterladen |

### D. Nährstoff-Referenz

Alle berechneten Nährstoffe und ihre Einheiten:

| Nährstoff | Einheit | Standardwert | Max |
|-----------|---------|--------------|-----|
| Vitamin D | IU | 2000 | 5000 |
| Vitamin B12 | mcg | 500 | 2000 |
| Omega-3 | mg | 1000 | 3000 |
| Magnesium | mg | 300 | 600 |
| Zinc | mg | 15 | 40 |
| Vitamin C | mg | 500 | 2000 |
| NMN | mg | 250 | 1000 |
| Coenzym Q10 | mg | 100 | 400 |

---

## 📞 Nächste Schritte

1. ✅ Shopify-Seiten einrichten
2. ✅ Server aufsetzen und API deployen
3. ✅ Email-Konfiguration testen
4. ⏳ Partner-API Code erhalten und integrieren
5. ⏳ Auswertungscode vom Entwicklerteam erhalten
6. ⏳ Testdaten durchlaufen lassen
7. ⏳ Mit echten Bestellungen testen
8. ⏳ Live gehen

---

**Version:** 1.0.0
**Datum:** 21. Januar 2026
**Status:** Bereit für Integration

Bei Fragen bitte an: gina.pommerenke@biovariance.com
