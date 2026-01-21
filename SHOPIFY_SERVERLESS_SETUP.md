# Bio-Eta Essenza - Serverlose Shopify-Integration
## Setup-Anleitung (KEIN Server erforderlich!)

**Version:** 2.0 - Serverless
**Status:** ✅ Produktionsbereit
**Dauer:** 30-45 Minuten

---

## 🎯 Überblick

Diese serverlose Lösung nutzt **Google Sheets** als Datenbank und **Google Apps Script** für Email-Automation.

**Vorteile:**
- ✅ **Keine Hosting-Kosten** - Alles kostenlos über Google
- ✅ **Keine Server-Wartung** - Google kümmert sich um alles
- ✅ **Einfaches Setup** - In 30-45 Minuten fertig
- ✅ **Automatische Backups** - Google Drive Sync
- ✅ **CSV-Export** - Direkt aus Google Sheets
- ✅ **Email-Automation** - Tägliche Reports automatisch

**Was Sie benötigen:**
- Google Account (kostenlos)
- Shopify Store
- 30-45 Minuten Zeit

---

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Google Sheets Setup (10 Minuten)

#### 1.1 Google Apps Script erstellen

1. Öffnen Sie https://script.google.com
2. Klicken Sie auf **"+ Neues Projekt"**
3. Benennen Sie es: `Bio-Eta Essenza Questionnaire API`

#### 1.2 Code einfügen

1. Löschen Sie den Beispielcode
2. Öffnen Sie die Datei `google-apps-script.js` aus diesem Repository
3. Kopieren Sie den **gesamten Code**
4. Fügen Sie ihn in das Script-Editor-Fenster ein

#### 1.3 Konfiguration anpassen

Passen Sie die Konfiguration an (Zeilen 15-25):

```javascript
const CONFIG = {
    EMAIL_RECIPIENT: 'gina.pommerenke@biovariance.com',  // ← Ihre Email
    SPREADSHEET_NAME: 'Bio-Eta Essenza - Personalisierte Bestellungen',
    TIMEZONE: 'Europe/Berlin',
    DAILY_EMAIL_HOUR: 9  // 9:00 Uhr morgens
};
```

#### 1.4 Speichern

Klicken Sie auf **💾 Speichern** (oder Strg+S)

#### 1.5 Berechtigungen erteilen

1. Klicken Sie auf **▶️ Ausführen** (play button oben)
2. Wählen Sie Funktion: `testSetup`
3. Es erscheint ein Popup: **"Berechtigung erforderlich"**
4. Klicken Sie auf **"Berechtigungen prüfen"**
5. Wählen Sie Ihren Google Account
6. Klicken Sie auf **"Erweitert"** → **"Zu [Projektname] wechseln"**
7. Klicken Sie auf **"Zulassen"**

#### 1.6 Test durchführen

1. Die Funktion `testSetup` sollte nun durchlaufen
2. Prüfen Sie die **Logs** (unten im Editor)
3. Sie sollten sehen: `"Test successful! Check your Google Sheet and email."`

#### 1.7 Google Sheet prüfen

1. Klicken Sie auf **Ausführung** → `getSpreadsheetUrl`
2. In den Logs erscheint die URL Ihres Sheets
3. Öffnen Sie die URL → Ihr Google Sheet ist erstellt!
4. Sie sollten einen Test-Eintrag sehen

---

### Schritt 2: Web App Deployment (5 Minuten)

#### 2.1 Deploy durchführen

1. Klicken Sie oben rechts auf **"Bereitstellen"** → **"Neue Bereitstellung"**
2. Wählen Sie Typ: **"Web-App"**
3. Einstellungen:
   - **Beschreibung:** "Bio-Eta Essenza Questionnaire API v1"
   - **Ausführen als:** "Ich" (Ihre Email)
   - **Zugriff:** "Jeder" (wichtig!)
4. Klicken Sie auf **"Bereitstellen"**

#### 2.2 URL kopieren

1. Kopieren Sie die **"Web-App-URL"**
2. Format: `https://script.google.com/macros/s/XXXXXXXX/exec`
3. **Diese URL benötigen Sie für Shopify!**

**Wichtig:** Speichern Sie diese URL - Sie brauchen sie gleich!

---

### Schritt 3: Shopify Fragebogen-Seite einrichten (10 Minuten)

#### 3.1 Neue Seite erstellen

1. Gehe zu **Shopify Admin**
2. **Online Store** → **Pages**
3. Klicke **Add page**

#### 3.2 Seite konfigurieren

- **Titel:** `Personalisierungsfragebogen` oder `Personalized Questionnaire`
- **URL-Handle:** `personalized-questionnaire` (wichtig!)

#### 3.3 HTML-Code einfügen

1. Klicke auf **Show HTML** (`<>` Button oben rechts)
2. Öffne die Datei `personalized-questionnaire-serverless.html`
3. Kopiere den **gesamten Inhalt**
4. Füge ihn in den HTML-Editor ein

#### 3.4 Google Script URL einfügen

Suche im Code nach dieser Zeile (ca. Zeile 580):

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

Ersetze `YOUR_SCRIPT_ID` mit deiner tatsächlichen URL aus Schritt 2.2:

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXXXXXXXXXXXXXX/exec';
```

#### 3.5 Speichern & Veröffentlichen

1. Klicke **Save**
2. Klicke **View page** um zu testen
3. Prüfe, ob der Fragebogen lädt

---

### Schritt 4: Order Confirmation Redirect (10 Minuten)

#### 4.1 Shopify Plus: Additional Scripts

**Wenn Sie Shopify Plus haben:**

1. Gehe zu **Settings** → **Checkout**
2. Scrolle zu **Order status page**
3. Unter **Additional scripts** füge Code ein:
   - Öffne `order-confirmation-redirect.liquid`
   - Kopiere den gesamten Code
   - Füge ihn ein
4. **Speichern**

#### 4.2 Standard Shopify: Theme Code

**Wenn Sie KEIN Shopify Plus haben:**

1. Gehe zu **Online Store** → **Themes**
2. Klicke **Actions** → **Edit code**
3. Suche nach `Templates` → `checkout.liquid` ODER
4. Suche nach `Sections` → `checkout-footer.liquid`
5. Öffne die Datei
6. Füge den Code aus `order-confirmation-redirect.liquid` **am Ende** ein
7. **Save**

#### 4.3 Produktnamen anpassen

Im eingefügten Code, suche nach (ca. Zeile 30):

```liquid
{% if line_item.product.title contains 'Bio-Eta Essenza' or line_item.product.title contains 'Personalized' %}
```

Ersetze `'Bio-Eta Essenza'` mit dem exakten Namen deines Produkts.

**Oder nutze Tags (empfohlen):**

```liquid
{% if line_item.product.tags contains 'personalized-questionnaire' %}
```

Dann füge den Tag `personalized-questionnaire` zu deinem Produkt hinzu.

---

### Schritt 5: Produktvarianten einrichten (5 Minuten)

#### 5.1 Produkt erstellen/bearbeiten

1. **Products** → **Add product** (oder bestehende öffnen)
2. **Titel:** Bio-Eta Essenza / Personalized
3. **Beschreibung:** [Deine Produktbeschreibung]

#### 5.2 Varianten hinzufügen

Klicke auf **Add variant** und erstelle:

| Variant Title | SKU | Preis |
|--------------|-----|-------|
| 1 Monat | ESSENZA-1M | €XX.XX |
| 3 Monate | ESSENZA-3M | €XX.XX |
| 6 Monate | ESSENZA-6M | €XX.XX |

**Wichtig:** Die Variant-Titel müssen "Monat" oder "Month" enthalten!

#### 5.3 Optional: Tag hinzufügen

Unter **Tags** füge hinzu: `personalized-questionnaire`

(Nur nötig, wenn du Tags für Redirect-Erkennung nutzt)

---

### Schritt 6: Email-Automation einrichten (5 Minuten)

#### 6.1 Täglichen Trigger erstellen

1. Zurück zu **script.google.com**
2. Öffne dein Projekt
3. Klicke links auf **⏰ Triggers** (Uhr-Symbol)
4. Klicke unten rechts **"+ Add Trigger"**

#### 6.2 Trigger konfigurieren

- **Funktion auswählen:** `sendDailyReport`
- **Ereignisquelle:** "Zeitgesteuert"
- **Zeitgesteuerter Trigger-Typ:** "Tageszeitbasiert"
- **Uhrzeit:** 9 Uhr bis 10 Uhr (oder deine gewünschte Zeit)
- **Fehlerbenachrichtigungen:** "Sofort benachrichtigen"

#### 6.3 Speichern

Klicke **Save**

✅ Fertig! Jetzt werden täglich automatisch Berichte gesendet.

---

## 🧪 Testing

### Test 1: Fragebogen testen

1. Gehe zu: `https://dein-shop.myshopify.com/pages/personalized-questionnaire`
2. Fülle den Fragebogen aus
3. Sende ab

**Prüfen:**
- ✅ Completion-Screen erscheint
- ✅ Neuer Eintrag in Google Sheet
- ✅ Bestätigungs-Email erhalten (an eingegebene Email)

### Test 2: Order Redirect testen

1. Erstelle eine **Test-Bestellung** in Shopify
   - Admin → Orders → Create order
   - Füge dein Personalized-Produkt hinzu
   - "Mark as paid"
2. Öffne die Order → **View order status page**
3. Prüfe:
   - ✅ Redirect-Banner erscheint
   - ✅ Countdown läuft
   - ✅ Button "Zum Fragebogen" funktioniert

### Test 3: Email-Report testen

1. In Google Apps Script
2. Wähle Funktion: `testDailyReport`
3. Klicke **▶️ Ausführen**
4. Prüfe dein Email-Postfach (gina.pommerenke@biovariance.com)
5. ✅ Email mit CSV-Anhang erhalten

---

## 📊 Daten verwalten

### Google Sheet öffnen

**Methode 1:**
1. Gehe zu **script.google.com**
2. Öffne dein Projekt
3. Funktion: `getSpreadsheetUrl`
4. **Ausführen** → URL in Logs

**Methode 2:**
1. Gehe zu **drive.google.com**
2. Suche: `Bio-Eta Essenza - Personalisierte Bestellungen`

### CSV Export

**Automatisch:**
- Täglich per Email als Anhang

**Manuell:**
1. Öffne Google Sheet
2. **Datei** → **Herunterladen** → **Kommagetrennte Werte (.csv)**

### Daten für CRM importieren

1. Downloade CSV aus Google Sheet
2. Öffne dein CRM-System
3. Importiere CSV-Datei

Die Spalten sind standardisiert und direkt importierbar.

---

## 🔧 Anpassungen

### Email-Zeitplan ändern

1. Google Apps Script → **Triggers**
2. Klicke auf den Trigger
3. Ändere die Uhrzeit
4. **Save**

### Email-Empfänger hinzufügen

Im `google-apps-script.js`, Zeile 18:

```javascript
EMAIL_RECIPIENT: 'email1@example.com, email2@example.com',
```

Mehrere Empfänger mit Komma trennen.

### Fragebogen-Fragen ändern

1. Öffne deine Shopify-Seite
2. **Show HTML**
3. Suche die Frage, die du ändern möchtest
4. Passe Text an
5. **Save**

### Neue Problembereichs-Fragen

In `personalized-questionnaire-serverless.html`, ca. Zeile 590:

```javascript
const PROBLEM_AREA_QUESTIONS = {
    energy: [
        {
            id: 'energy_new_question',
            label: 'Ihre neue Frage?',
            type: 'yesno'  // oder 'scale' oder 'text'
        },
        // ... weitere Fragen
    ]
};
```

### Nährstoff-Berechnung anpassen

In `personalized-questionnaire-serverless.html`, Funktion `calculateNutrientConcentrations()` (ca. Zeile 850):

```javascript
// Base-Werte anpassen
const nutrients = {
    vitaminD: 2000,  // ← hier ändern
    omega3: 1000,    // ← hier ändern
    // ...
};
```

---

## 🔍 Troubleshooting

### Problem: Daten kommen nicht in Google Sheet an

**Lösung 1: Script-URL prüfen**
```javascript
// In personalized-questionnaire-serverless.html
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```
- Prüfe, ob URL korrekt ist
- Muss enden mit `/exec`

**Lösung 2: Berechtigung prüfen**
- Google Apps Script → Deploy → "Zugriff: Jeder"
- Neu deployen, wenn nötig

**Lösung 3: Browser-Console prüfen**
- Shopify-Seite öffnen
- F12 → Console-Tab
- Fehler-Nachrichten lesen

### Problem: Email wird nicht gesendet

**Lösung 1: Gmail-Limits**
- Google erlaubt max. 100 Emails/Tag
- Prüfe Quota: Script → Ausführungen

**Lösung 2: Email-Adresse prüfen**
```javascript
EMAIL_RECIPIENT: 'gina.pommerenke@biovariance.com',  // Richtig geschrieben?
```

**Lösung 3: Trigger prüfen**
- Script → Triggers
- Trigger vorhanden?
- Fehler in Ausführungsprotokoll?

### Problem: Redirect funktioniert nicht

**Lösung 1: Produkt-Erkennung**
```liquid
{% if line_item.product.title contains 'Bio-Eta Essenza' %}
```
- Produktname exakt richtig?
- Groß-/Kleinschreibung beachten!

**Lösung 2: URL prüfen**
```liquid
<a href="/pages/personalized-questionnaire?order_id=...">
```
- Seite existiert?
- URL-Handle korrekt? (`personalized-questionnaire`)

**Lösung 3: Cache leeren**
- Browser-Cache löschen
- Inkognito-Modus testen

### Problem: CSV-Export fehlt Spalten

**Lösung:**
1. Google Apps Script öffnen
2. Funktion `setupHeaders()` anpassen
3. Spalten hinzufügen
4. Google Sheet löschen (wird neu erstellt)
5. `testSetup` ausführen

---

## 📈 Monitoring

### Tägliche Checks

**Was prüfen:**
- ✅ Email-Report erhalten?
- ✅ Anzahl Submissions korrekt?
- ✅ CSV-Anhang vollständig?

**Bei Problemen:**
1. Google Apps Script → **Ausführungen**
2. Fehler-Meldungen prüfen
3. Bei Bedarf: `testSetup` erneut ausführen

### Wöchentliche Checks

- Google Sheet Backup herunterladen
- Daten in CRM importieren
- Quota prüfen (Script → Quoten)

---

## 🎓 Erweiterte Funktionen

### Partner-API Integration

Wenn dein Abfüllpartner eine API hat:

**In `google-apps-script.js` hinzufügen:**

```javascript
function sendToPartnerAPI(data) {
    const url = 'https://partner-api.example.com/submit';
    const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
            orderId: data.orderId,
            nutrients: data.nutrients,
            customer: {
                name: data.fullName,
                email: data.email
            }
        })
    };

    try {
        UrlFetchApp.fetch(url, options);
    } catch (error) {
        Logger.log('Partner API Error: ' + error);
    }
}
```

**Dann in `doPost()` aufrufen:**

```javascript
function doPost(e) {
    // ... bestehender Code
    saveToSheet(sheet, data);

    // Neu hinzufügen:
    sendToPartnerAPI(data);

    // ...
}
```

### Slack-Benachrichtigung

Bei jeder neuen Submission:

```javascript
function sendSlackNotification(data) {
    const webhookUrl = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';

    const message = {
        text: `🧬 Neue personalisierte Bestellung!\n\n` +
              `Name: ${data.fullName}\n` +
              `Email: ${data.email}\n` +
              `Bereiche: ${data.selectedAreas.join(', ')}`
    };

    UrlFetchApp.fetch(webhookUrl, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(message)
    });
}
```

### Datenbank-Alternative

Für sehr große Datenmengen (>10.000 Einträge):

Nutze **Firebase Firestore** statt Google Sheets:
- Kostenlos bis 50.000 Lesevorgänge/Tag
- Schneller als Sheets
- Bessere Abfrage-Möglichkeiten

(Setup-Anleitung auf Anfrage)

---

## 📊 Kosten-Übersicht

### Kostenlos (aktuelles Setup):

| Service | Limit | Kosten |
|---------|-------|--------|
| Google Apps Script | 90 Min/Tag | €0 |
| Google Sheets | 5 Mio. Zellen | €0 |
| Google Drive | 15 GB | €0 |
| Gmail (MailApp) | 100 Emails/Tag | €0 |

**Gesamt: €0/Monat** 🎉

### Bei Skalierung (>100 Orders/Tag):

| Service | Preis |
|---------|-------|
| Google Workspace | €6/Nutzer/Monat |
| SendGrid (Email) | $15/Monat |
| Firebase | $25/Monat |

---

## ✅ Go-Live Checklist

Vor dem produktiven Einsatz:

- [ ] Google Apps Script deployed
- [ ] Test-Submission erfolgreich
- [ ] Google Sheet erstellt und getestet
- [ ] Shopify-Seite erstellt und getestet
- [ ] Order Redirect eingerichtet und getestet
- [ ] Email-Trigger konfiguriert
- [ ] Test-Email erhalten
- [ ] Produktvarianten erstellt
- [ ] Test-Bestellung durchgeführt
- [ ] Alle Emails funktionieren
- [ ] Datenschutzerklärung aktualisiert
- [ ] Team geschult

---

## 📞 Support

**Bei Fragen:**
- Email: gina.pommerenke@biovariance.com
- Betreff: "Serverless Setup - [Ihr Problem]"

**Dokumentation:**
- Diese Datei: `SHOPIFY_SERVERLESS_SETUP.md`
- Code-Kommentare in `google-apps-script.js`
- Code-Kommentare in `personalized-questionnaire-serverless.html`

---

## 🚀 Nächste Schritte

Nach erfolgreichem Setup:

1. **7 Tage Testphase**
   - Teste alle Funktionen
   - Prüfe Email-Reports
   - Validiere Datenqualität

2. **Soft Launch**
   - 10-20 echte Bestellungen
   - Feedback sammeln
   - Anpassungen vornehmen

3. **Full Launch**
   - Alle Kunden
   - Marketing aktivieren
   - Monitoring einrichten

4. **Optimierung**
   - A/B-Testing der Fragen
   - Conversion-Rate tracken
   - Fragebogen iterativ verbessern

---

**Version:** 2.0 - Serverless
**Letzte Aktualisierung:** 21. Januar 2026
**Status:** ✅ Produktionsbereit

**Entwickelt für Bio-Eta Essenza / Biovariance GmbH**
**Kontakt:** gina.pommerenke@biovariance.com
