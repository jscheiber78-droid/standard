# Bio-Eta Essenza - Serverlose Shopify-Integration 🎉

**KEIN Server erforderlich! Alles läuft über Google (kostenlos)**

## 🚀 Quick Start (30 Minuten)

### Was Sie benötigen:
- ✅ Google Account (kostenlos)
- ✅ Shopify Store
- ✅ 30-45 Minuten Zeit

### Setup in 3 Schritten:

#### 1️⃣ Google Apps Script (15 Min)
1. Öffne https://script.google.com
2. Neues Projekt erstellen
3. Code aus `google-apps-script.js` einfügen
4. Email-Adresse in Config anpassen
5. Deploy as Web App
6. **URL kopieren** ← wichtig!

#### 2️⃣ Shopify Fragebogen-Seite (10 Min)
1. Shopify Admin → Pages → Add page
2. Titel: `Personalisierungsfragebogen`
3. HTML-Code aus `personalized-questionnaire-serverless.html` einfügen
4. **Google Script URL einfügen** (Zeile 580)
5. Speichern & testen

#### 3️⃣ Order Redirect (5 Min)
1. Shopify → Settings → Checkout → Additional Scripts
2. Code aus `order-confirmation-redirect.liquid` einfügen
3. Produktnamen anpassen
4. Speichern

**✅ Fertig! System ist live.**

---

## 💰 Kosten: €0/Monat

| Was | Limit | Kosten |
|-----|-------|--------|
| Google Apps Script | 90 Min/Tag | Kostenlos |
| Google Sheets | 5 Mio. Zellen | Kostenlos |
| Email Versand | 100/Tag | Kostenlos |
| **Gesamt** | | **€0** |

Reicht für **~500 Bestellungen/Monat**

---

## 📁 Dateien (Serverless)

| Datei | Zweck | Wo |
|-------|-------|-----|
| `personalized-questionnaire-serverless.html` | Fragebogen | Shopify Page |
| `google-apps-script.js` | Backend | script.google.com |
| `order-confirmation-redirect.liquid` | Redirect | Shopify Checkout |
| `SHOPIFY_SERVERLESS_SETUP.md` | Anleitung | Diese Repo |

---

## ✨ Features

### Für Kunden:
- ✅ Dynamischer Fragebogen (7 Problembereich-Kategorien)
- ✅ Automatische Weiterleitung nach Bestellung
- ✅ Mobile-optimiert
- ✅ Sofortige Bestätigungs-Email

### Für Admins:
- ✅ Automatische Nährstoffberechnung (20+ Nährstoffe)
- ✅ Tägliche Email-Reports (mit CSV)
- ✅ Google Sheets als "Datenbank"
- ✅ Einfacher CSV-Export
- ✅ Kein Server, keine Wartung

---

## 📊 So funktioniert es

```
Kunde bestellt
    ↓
Redirect zum Fragebogen (Shopify Page)
    ↓
Fragebogen ausfüllen
    ↓
Daten zu Google Apps Script (HTTPS POST)
    ↓
┌─────────────────────────────┐
│  Google Apps Script:        │
│  1. In Google Sheets        │
│  2. Nährstoffe berechnen    │
│  3. Email an Kunde          │
└─────────────────────────────┘
    ↓
Täglich um 9 Uhr: Email-Report an Admin
```

---

## 🧪 Testing

### Test 1: Fragebogen
```
https://dein-shop.myshopify.com/pages/personalized-questionnaire
```
→ Ausfüllen → Submit → ✅ Google Sheet prüfen

### Test 2: Google Script
1. script.google.com → Dein Projekt
2. Funktion: `testSetup`
3. Ausführen
4. ✅ Sheet erstellt, Email erhalten

### Test 3: Order Redirect
1. Test-Bestellung in Shopify
2. Order Status Page öffnen
3. ✅ Redirect-Banner erscheint

---

## 📖 Vollständige Anleitung

Siehe: **`SHOPIFY_SERVERLESS_SETUP.md`**

Schritt-für-Schritt mit Screenshots und Troubleshooting.

---

## 🆚 Vergleich: Server vs. Serverless

| Feature | Mit Server | Serverless (Google) |
|---------|------------|---------------------|
| **Setup-Zeit** | 2-3 Stunden | 30-45 Minuten |
| **Kosten** | $5-10/Monat | €0/Monat |
| **Wartung** | Regelmäßig | Keine |
| **Skalierung** | Manuell | Automatisch |
| **Backup** | Selbst | Automatisch (Google) |
| **Email** | SMTP-Config | Automatisch |
| **CSV-Export** | API-Endpoint | Google Sheets |

**Empfehlung:** Serverless für Start, Server bei >1000 Orders/Monat

---

## 🔧 Häufige Anpassungen

### Email-Empfänger ändern
```javascript
// In google-apps-script.js, Zeile 18
EMAIL_RECIPIENT: 'neue-email@example.com'
```

### Email-Zeitplan ändern
Google Apps Script → Triggers → Trigger bearbeiten

### Fragebogen-Fragen ändern
Shopify Page → HTML bearbeiten → Frage suchen → Anpassen

### Nährstoff-Berechnung anpassen
`personalized-questionnaire-serverless.html` → Funktion `calculateNutrientConcentrations()`

---

## 🐛 Troubleshooting

### Daten kommen nicht an
→ Google Script URL korrekt? (Zeile 580 in HTML)
→ Deploy mit "Zugriff: Jeder"?

### Email wird nicht gesendet
→ Trigger erstellt? (script.google.com → Triggers)
→ Email-Adresse korrekt?

### Redirect funktioniert nicht
→ Produktnamen korrekt?
→ Shopify-Seite URL: `/pages/personalized-questionnaire`?

**Mehr Lösungen:** `SHOPIFY_SERVERLESS_SETUP.md` → Troubleshooting

---

## 📞 Support

**Email:** gina.pommerenke@biovariance.com
**Betreff:** "Serverless Setup - [Problem]"

**Dokumentation:**
1. `SHOPIFY_SERVERLESS_SETUP.md` - Vollständige Anleitung
2. `SERVERLESS_README.md` - Diese Datei (Übersicht)
3. Code-Kommentare in allen Dateien

---

## 🎯 Nächste Schritte

### Heute (30-45 Min):
1. ✅ Google Apps Script einrichten
2. ✅ Shopify-Seite erstellen
3. ✅ Redirect einrichten
4. ✅ Testen

### Diese Woche:
- Produktvarianten erstellen (1, 3, 6 Monate)
- Test-Bestellungen durchführen
- Daten in Google Sheet prüfen
- Email-Reports verifizieren

### Nächster Monat:
- Go-Live mit echten Kunden
- Feedback sammeln
- Fragebogen optimieren
- Ggf. auf Server-Version upgraden

---

## ✅ Vorteile der Serverlosen Lösung

1. **€0 Kosten** - Komplett kostenlos
2. **Schnelles Setup** - 30-45 Minuten statt Stunden
3. **Keine Wartung** - Google kümmert sich um alles
4. **Automatische Backups** - Google Drive
5. **Skaliert automatisch** - Bis 500+ Orders/Monat
6. **Einfach zu verstehen** - Alles in Google Sheets sichtbar
7. **CSV-Export** - Ein Klick in Google Sheets
8. **Email automatisch** - Täglich um 9 Uhr

---

## 🔄 Migration zu Server (später)

Falls du später auf Server-Version wechseln möchtest:

1. Alle Dateien sind schon vorbereitet:
   - `api-handler.js`
   - `package.json`
   - `.env.example`

2. Daten aus Google Sheets exportieren (CSV)
3. Server aufsetzen (siehe `PERSONALIZED_INTEGRATION_GUIDE.md`)
4. CSV importieren
5. Shopify-Seite URL anpassen

**Kein Datenverlust, nahtloser Übergang**

---

**Version:** 2.0 - Serverless
**Status:** ✅ Produktionsbereit
**Datum:** 21. Januar 2026

**Entwickelt für Bio-Eta Essenza**

---

## 🎉 Los geht's!

1. Öffne `SHOPIFY_SERVERLESS_SETUP.md`
2. Folge Schritt 1-6
3. 30-45 Minuten später: ✅ Live!

**Viel Erfolg! 🚀**
