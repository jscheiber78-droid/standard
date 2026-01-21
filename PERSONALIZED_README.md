# Bio-Eta Essenza - Personalisiertes Bestellsystem

Ein vollständiges System für personalisierte Nährstoff-Supplementierung basierend auf individuellen Kundenfragebogen.

## 🎯 Projektziel

Dieses System ermöglicht es Kunden, nach dem Kauf von "Bio-Eta Essenza Personalized" einen detaillierten Fragebogen auszufüllen. Basierend auf den Antworten werden automatisch personalisierte Nährstoffkonzentrationen berechnet, die dann an den Abfüllpartner übermittelt werden.

## ✨ Features

### Kundenansicht
- ✅ Automatische Weiterleitung zum Fragebogen nach Bestellabschluss
- ✅ Responsive, benutzerfreundliches Fragebogen-Interface
- ✅ Dynamische Fragen basierend auf ausgewählten Problembereichen
- ✅ 7 verschiedene Problembereichs-Kategorien
- ✅ Verschiedene Fragetypen (Ja/Nein, Skala 1-10, Textfelder)
- ✅ Fortschrittsanzeige
- ✅ Mobile-optimiert

### Backend-System
- ✅ Automatische Berechnung der Nährstoffkonzentrationen
- ✅ CSV-Export für CRM-Integration
- ✅ Tägliche automatisierte Email-Berichte
- ✅ API-Schnittstelle für Partner (Abfüllung)
- ✅ Daten-Archivierung
- ✅ Fehlerbehandlung und Logging

### Admin-Funktionen
- ✅ CSV-Download on-demand
- ✅ Manuelle Email-Auslösung
- ✅ Daten-Backup-System
- ✅ Health-Check Monitoring

## 📁 Projektstruktur

```
personalized-system/
│
├── personalized-questionnaire.html    # Hauptfragebogen (für Shopify Page)
├── order-confirmation-redirect.liquid # Redirect-Code (für Shopify Checkout)
├── api-handler.js                     # Backend API-Server (Node.js)
├── package.json                       # Node.js Dependencies
├── .env.example                       # Konfiguration Template
│
├── PERSONALIZED_INTEGRATION_GUIDE.md  # Vollständige Integrationsdoku
└── PERSONALIZED_README.md             # Diese Datei
```

## 🚀 Quick Start

### 1. Shopify Integration (5 Minuten)

**Schritt 1: Fragebogen-Seite erstellen**
1. Shopify Admin → Online Store → Pages → Add page
2. Titel: "Personalized Questionnaire"
3. URL: `personalized-questionnaire` (wichtig!)
4. HTML-Modus aktivieren (`<>` Button)
5. Inhalt von `personalized-questionnaire.html` einfügen
6. Speichern

**Schritt 2: Order Redirect einrichten**
1. Settings → Checkout → Additional Scripts (Shopify Plus)
   ODER Online Store → Themes → Edit Code → checkout.liquid
2. Code von `order-confirmation-redirect.liquid` einfügen
3. Produktnamen im Code anpassen (Zeile 30)
4. Speichern

### 2. API-Server Setup (10 Minuten)

```bash
# Dependencies installieren
npm install

# Konfiguration erstellen
cp .env.example .env
nano .env  # Email & Server-Einstellungen anpassen

# Server starten
npm start

# Oder mit Auto-Reload (Entwicklung)
npm run dev
```

### 3. Testen

1. Test-Bestellung in Shopify erstellen
2. Nach Bestellung: Redirect zum Fragebogen prüfen
3. Fragebogen ausfüllen und absenden
4. Prüfen:
   - Server Logs: `pm2 logs` oder `npm run dev` Output
   - CSV-Datei: `./data/questionnaire-responses.csv`
   - Email (falls konfiguriert)

## 📊 Fragebogen-Ablauf

### Sektion 1: Allgemeine Informationen
- Name, Alter, Geschlecht
- Körpergröße, Gewicht
- E-Mail

### Sektion 2: Problembereichs-Auswahl
Der Kunde wählt aus 7 Bereichen:

| Bereich | Icon | Beschreibung |
|---------|------|--------------|
| Energie & Vitalität | ⚡ | Müdigkeit, Energiemangel |
| Kognitive Funktion | 🧠 | Konzentration, Gedächtnis |
| Regeneration | 🔄 | Muskelregeneration, Erholung |
| Immunsystem | 🛡️ | Infektanfälligkeit |
| Stressresilienz | 😌 | Stressmanagement, Entspannung |
| Haut & Haare | ✨ | Hautqualität, Haargesundheit |
| Gelenke & Knochen | 🦴 | Gelenkschmerzen, Mobilität |

### Sektion 3: Bereichsspezifische Fragen
Für jeden ausgewählten Bereich werden 3-4 spezifische Fragen gestellt.

### Sektion 4: Lebensstil & Ernährung
- Schlafqualität und -dauer
- Stressniveau
- Sportfrequenz
- Raucherstatus
- Alkoholkonsum
- Ernährungsqualität und -typ
- Aktuelle Nahrungsergänzungsmittel

## 🧮 Nährstoffberechnung

Das System berechnet automatisch über 20 verschiedene Nährstoffe:

**Basis-Nährstoffe (alle Kunden):**
- Vitamin D, B12, C, E
- Omega-3-Fettsäuren
- Magnesium, Zinc
- CoQ10, NMN, Resveratrol
- PQQ, Alpha-Liponsäure

**Bereichsspezifische Ergänzungen:**

| Problembereich | Zusätzliche Nährstoffe |
|----------------|------------------------|
| Energie | Erhöhte CoQ10, B12, Magnesium, NMN |
| Kognition | Phosphatidylserin, erhöhte Omega-3 |
| Regeneration | BCAAs, erhöhte Vitamine C & E |
| Immunsystem | Quercetin, Probiotika, Vitamin C/D/Zinc |
| Stress | Ashwagandha, Rhodiola, L-Theanin |
| Haut & Haare | Kollagen, Biotin, Hyaluronsäure |
| Gelenke | Glucosamin, Chondroitin, MSM, Curcumin |

**Individuelle Anpassungen basierend auf:**
- Alter (50+: erhöhte Dosierungen)
- Geschlecht (Eisen, Calcium)
- Lebensstil (Sport, Schlaf, Stress, Ernährung)

## 📧 Email-Automation

**Täglicher Versand:** Jeden Tag um 9:00 Uhr

**Email enthält:**
- Zusammenfassung der neuen Einträge
- CSV-Datei als Anhang mit allen Daten
- Statistiken

**Zeitplan anpassen:**
```javascript
// In api-handler.js, Zeile ~430
cron.schedule('0 9 * * *', sendDailyEmail);  // Täglich 9:00 Uhr
cron.schedule('0 18 * * *', sendDailyEmail); // Täglich 18:00 Uhr
cron.schedule('0 9 * * 1-5', sendDailyEmail); // Montag-Freitag 9:00
```

**Manueller Versand:**
```bash
curl -X POST http://localhost:3000/apps/personalized-questionnaire/send-email
```

## 💾 Datenexport

### CSV-Format

**Standard-Spalten:**
```
timestamp, orderId, fullName, email, age, gender, height, weight,
selectedAreas, sleepQuality, sleepHours, stressLevel, exerciseFrequency,
smoking, alcoholConsumption, dietQuality, dietType, supplements,
vitaminD, vitaminB12, omega3, magnesium, zinc, ...
```

**Download:**
```bash
# Via API
curl http://localhost:3000/apps/personalized-questionnaire/download-csv -o export.csv

# Via Browser
http://ihre-domain.com/apps/personalized-questionnaire/download-csv
```

**Automatisches Backup:**
CSV-Dateien werden täglich archiviert in `./data/archive-TIMESTAMP.csv`

## 🔗 Partner-API Integration

### Vorbereitung

Die Integration ist vorbereitet für:
- REST API (JSON)
- SOAP/XML
- Custom Code-Module

### Code vom Partner integrieren

Wenn Sie den Integrationscode erhalten:

```javascript
// In api-handler.js, Funktion sendToPartnerAPI()

// Option 1: Einfacher HTTP POST
const response = await axios.post(
    'https://partner-api.example.com/submit',
    { orderId, nutrients, customer },
    { headers: { 'Authorization': 'Bearer YOUR_KEY' } }
);

// Option 2: Custom Modul
const partnerAPI = require('./partner-integration');
await partnerAPI.submitOrder({ orderId, nutrients });
```

### Konfiguration

In `.env`:
```env
PARTNER_API_ENDPOINT=https://partner-api.example.com/submit
PARTNER_API_KEY=your-api-key-here
```

## 🛠️ Wartung & Monitoring

### Server-Status prüfen

```bash
# PM2 Status
pm2 status

# Logs ansehen
pm2 logs personalized-api

# Server neu starten
pm2 restart personalized-api
```

### Health Check

```bash
curl http://localhost:3000/health

# Erwartete Antwort:
# {"status":"ok","timestamp":"2026-01-21T..."}
```

### Monitoring-Services einrichten

Empfohlene kostenlose Services:
- **UptimeRobot** - Server-Uptime-Monitoring
- **Papertrail** - Log-Management
- **Sentry** - Error Tracking

### Backup-Strategie

1. **Lokales Backup:** Täglich automatisch in `./data/`
2. **Cloud-Backup:** Optional AWS S3 oder Google Cloud Storage
3. **Email-Archiv:** Alle Emails enthalten CSV-Kopien

## 📈 Produktvarianten einrichten

In Shopify müssen 3 Varianten erstellt werden:

| Variant | SKU | Preis |
|---------|-----|-------|
| 1 Monat | ESSENZA-1M | €XX.XX |
| 3 Monate | ESSENZA-3M | €XX.XX |
| 6 Monate | ESSENZA-6M | €XX.XX |

**Wichtig:** Die Variant-Titel müssen "1 Monat", "3 Monate", "6 Monate" enthalten (exakte Schreibweise).

## 🔒 Sicherheit & Datenschutz

### DSGVO-Compliance

- ✅ Einwilligungserklärung im Fragebogen
- ✅ Datenschutzerklärung verlinkt
- ✅ Daten nur für angegebenen Zweck verwendet
- ✅ Löschfunktion implementierbar
- ✅ Datenminimierung (nur notwendige Daten)

### Best Practices

- ✅ HTTPS für alle Verbindungen
- ✅ Keine Passwörter in Code (nur .env)
- ✅ API-Rate-Limiting
- ✅ Input-Validierung
- ✅ Error-Handling ohne sensitive Daten

## 🐛 Troubleshooting

### Problem: Email wird nicht gesendet

**Lösung:**
1. Prüfe `.env` Konfiguration
2. Teste Email-Verbindung:
   ```bash
   node test-email.js
   ```
3. Für Gmail: App-spezifisches Passwort verwenden

### Problem: CSV wird nicht erstellt

**Lösung:**
```bash
# Berechtigungen prüfen
ls -la ./data/

# Verzeichnis erstellen
mkdir -p ./data
chmod 755 ./data
```

### Problem: Redirect funktioniert nicht

**Lösung:**
1. Prüfe Produktnamen in `order-confirmation-redirect.liquid`
2. Prüfe URL der Fragebogen-Seite: `/pages/personalized-questionnaire`
3. Prüfe Browser-Console auf Fehler

### Problem: CORS-Fehler

**Lösung:**
```bash
npm install cors
```

```javascript
// In api-handler.js
const cors = require('cors');
app.use(cors({
    origin: 'https://ihr-shop.myshopify.com'
}));
```

## 📚 Weiterführende Dokumentation

- **Vollständiger Integrationsleitfaden:** `PERSONALIZED_INTEGRATION_GUIDE.md`
  - Detaillierte Schritt-für-Schritt-Anleitungen
  - Alle Konfigurationsoptionen
  - Deployment-Szenarien
  - Erweiterte Anpassungen

- **API-Dokumentation:**
  - Endpoint-Referenz
  - Request/Response-Beispiele
  - Error-Codes

## 🔄 Update-Prozess

### Fragebogen aktualisieren

1. Bearbeite `personalized-questionnaire.html` lokal
2. In Shopify: Pages → Personalized Questionnaire
3. HTML-Modus aktivieren
4. Neuen Code einfügen
5. Speichern
6. Testen

### API-Server aktualisieren

```bash
# Code aktualisieren
git pull origin main

# Dependencies aktualisieren
npm install

# Server neu starten
pm2 restart personalized-api

# Prüfen
pm2 logs
```

## 📞 Support & Kontakt

**Bei Fragen zur Integration:**
- Email: gina.pommerenke@biovariance.com
- Betreff: "Personalisiertes System - [Ihr Thema]"

**Für technischen Support:**
- Siehe `PERSONALIZED_INTEGRATION_GUIDE.md` Abschnitt "Wartung & Support"

**Bei Problemen:**
1. Prüfe Logs: `pm2 logs`
2. Prüfe Health: `curl http://localhost:3000/health`
3. Prüfe Konfiguration: `.env` Datei
4. Siehe Troubleshooting-Abschnitt oben

## ✅ Go-Live Checklist

Vor dem produktiven Einsatz:

- [ ] Shopify-Seiten erstellt und getestet
- [ ] Server deployed und erreichbar
- [ ] Email-Konfiguration getestet
- [ ] CSV-Export funktioniert
- [ ] Partner-API Code integriert (wenn verfügbar)
- [ ] End-to-End Test mit echter Bestellung
- [ ] Backup-Strategie eingerichtet
- [ ] Monitoring-Services konfiguriert
- [ ] Datenschutzerklärung aktualisiert
- [ ] Team geschult

## 📊 Nächste Entwicklungsschritte

**Phase 1 (Aktuell):**
- ✅ Fragebogen-System
- ✅ Grundlegende Nährstoffberechnung
- ✅ CSV-Export
- ⏳ Partner-API Integration (wartet auf Code)

**Phase 2 (Zukünftig):**
- [ ] Dashboard für Admin
- [ ] Erweiterte Analytics
- [ ] A/B-Testing für Fragebogen
- [ ] Multi-Language Support
- [ ] Datenbank-Integration (PostgreSQL)

**Phase 3 (Optional):**
- [ ] Machine Learning für Nährstoff-Optimierung
- [ ] Kunden-Portal (Bestellhistorie ansehen)
- [ ] Mobile App
- [ ] Integration mit Labortests (Telomer-Test)

---

## 📄 Lizenz

Proprietär - Bio-Eta Essenza / Biovariance GmbH

---

**Version:** 1.0.0
**Letztes Update:** 21. Januar 2026
**Status:** Produktionsbereit (wartet auf Partner-API Code)

---

## 🙏 Danksagungen

Entwickelt für Bio-Eta Essenza im Rahmen der Longevity-Produktlinie.

Kontakt: gina.pommerenke@biovariance.com
