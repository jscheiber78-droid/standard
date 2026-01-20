# Essenza Backend - Bio-eta

Backend-Server für den Essenza Fragebogen mit Shopify-Integration, Metafields und Webhooks.

## Funktionen

- **REST API** für Fragebogen-Einreichungen
- **Shopify Integration** mit automatischer Kunden-Erstellung und Metafields
- **Webhook Support** für Echtzeit-Updates
- **E-Mail-Benachrichtigungen** für Kunden und Admin
- **MongoDB-Speicherung** für persistente Datenhaltung
- **Rate Limiting** und Sicherheitsfeatures

## Schnellstart

### 1. Installation

```bash
cd essenza-backend
npm install
```

### 2. Konfiguration

Kopiere die Beispiel-Konfiguration und passe sie an:

```bash
cp .env.example .env
```

Bearbeite `.env` mit deinen Werten:

```env
# Server
PORT=3000
NODE_ENV=development

# Shopify (Pflicht)
SHOPIFY_SHOP_DOMAIN=dein-shop.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx

# MongoDB (Optional)
MONGODB_URI=mongodb://localhost:27017/essenza

# E-Mail (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=email@gmail.com
SMTP_PASS=app-password
```

### 3. Server starten

```bash
# Entwicklung (mit Auto-Reload)
npm run dev

# Produktion
npm start
```

Server läuft auf `http://localhost:3000`

## API-Endpunkte

### Fragebogen

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| `POST` | `/api/questionnaire` | Neuen Fragebogen einreichen |
| `GET` | `/api/questionnaire/:submissionId` | Fragebogen abrufen |
| `GET` | `/api/questionnaire/email/:email` | Fragebögen nach E-Mail |
| `GET` | `/api/questionnaire` | Alle Fragebögen (Admin) |
| `PUT` | `/api/questionnaire/:submissionId/status` | Status aktualisieren |
| `DELETE` | `/api/questionnaire/:submissionId` | Fragebogen löschen |

### Webhooks

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| `POST` | `/api/webhooks/shopify` | Shopify Webhook Empfänger |
| `POST` | `/api/webhooks/setup` | Webhooks registrieren |
| `GET` | `/api/webhooks/list` | Webhooks auflisten |
| `DELETE` | `/api/webhooks/:webhookId` | Webhook löschen |

## Shopify-Integration einrichten

### 1. Private App erstellen

1. Shopify Admin öffnen
2. Settings → Apps and sales channels → Develop apps
3. "Create an app" klicken
4. App-Name: "Essenza Questionnaire"
5. Configure Admin API scopes:
   - `read_customers`, `write_customers`
   - `read_customer_events`
   - `read_orders`
6. Install App und Access Token kopieren

### 2. Access Token eintragen

In `.env`:

```env
SHOPIFY_SHOP_DOMAIN=dein-shop.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
```

### 3. Webhooks registrieren

```bash
curl -X POST http://localhost:3000/api/webhooks/setup \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"baseUrl": "https://your-backend-domain.com"}'
```

## Frontend-Integration

### Konfiguration im Frontend

Im HTML vor dem Fragebogen-Script:

```html
<script>
window.EssenzaConfig = {
    apiEndpoint: 'https://your-backend.com/api/questionnaire',
    apiKey: null, // Optional
    enableLocalStorage: true,
    enableCustomEvent: true
};
</script>
<script src="essenza-script.js"></script>
```

### Event Listener

```javascript
// Erfolgreiche Einreichung
window.addEventListener('essenza-questionnaire-submitted', (e) => {
    console.log('Submission ID:', e.detail.submissionId);
    console.log('Shopify Customer:', e.detail.serverResponse.shopify);
});

// Fehler
window.addEventListener('essenza-questionnaire-error', (e) => {
    console.error('Fehler:', e.detail.error);
});
```

## Metafields in Shopify

Die Fragebogen-Daten werden in Kunden-Metafields gespeichert:

| Namespace | Key | Beschreibung |
|-----------|-----|--------------|
| `essenza` | `questionnaire_data` | Vollständige Fragebogen-Daten (JSON) |
| `essenza` | `health_categories` | Gewählte Kategorien (Liste) |

### Metafields in Liquid verwenden

```liquid
{% assign essenza_data = customer.metafields.essenza.questionnaire_data.value %}
{% if essenza_data %}
  <h3>Deine Essenza-Kategorien:</h3>
  <ul>
    {% for category in essenza_data.kategorien %}
      <li>{{ category }}</li>
    {% endfor %}
  </ul>
{% endif %}
```

### Metafields in Shopify Admin anzeigen

1. Settings → Custom data → Customers
2. "Add definition" → Namespace: `essenza`, Key: `questionnaire_data`

## Datenstruktur

### Fragebogen-Einreichung

```json
{
  "personal": {
    "vorname": "Max",
    "nachname": "Mustermann",
    "email": "max@example.de",
    "geschlecht": "maennlich",
    "schwangerschaft": "nicht_zutreffend",
    "adresse": {
      "strasse": "Musterstraße 1",
      "plz": "12345",
      "ort": "Berlin"
    },
    "groesse": 180,
    "gewicht": 75,
    "aktivitaet": 7
  },
  "kategorien": ["mentale_gesundheit", "stress_schlaf", "immunsystem"],
  "kategorie_antworten": {
    "mentale_gesundheit": {
      "konzentration": 6,
      "vergessen": 4,
      "muede": 7,
      "laune": 5
    }
  },
  "lebensstil": {
    "familie_erkrankungen": "2",
    "zigaretten": "0",
    "ernaehrung": {
      "milch": 40,
      "obst_gemuese": 60
    }
  }
}
```

### API-Antwort

```json
{
  "success": true,
  "message": "Fragebogen erfolgreich übermittelt",
  "submissionId": "ESS-M5K2X9-A1B2C3",
  "shopify": {
    "customerId": 1234567890,
    "isNewCustomer": true
  }
}
```

## Deployment

### Heroku

```bash
heroku create essenza-backend
heroku config:set SHOPIFY_SHOP_DOMAIN=xxx
heroku config:set SHOPIFY_ACCESS_TOKEN=xxx
heroku config:set MONGODB_URI=xxx
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Vercel/Railway

Einfach Repository verbinden und Umgebungsvariablen setzen.

## Sicherheit

- **Rate Limiting**: 100 Requests pro 15 Minuten
- **CORS**: Nur konfigurierte Origins erlaubt
- **Helmet**: Security Headers aktiviert
- **Webhook-Verifizierung**: HMAC-SHA256 Signaturprüfung
- **Input-Validierung**: Alle Eingaben werden validiert und sanitized

## Fehlerbehandlung

| Status | Bedeutung |
|--------|-----------|
| 200 | Erfolg |
| 201 | Erstellt |
| 400 | Validierungsfehler |
| 401 | Nicht autorisiert |
| 403 | Zugriff verweigert |
| 404 | Nicht gefunden |
| 429 | Rate Limit erreicht |
| 500 | Serverfehler |

## Support

Bei Fragen: info@bio-eta.de
