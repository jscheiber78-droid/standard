# Essenza Fragebogen - Bio-eta

## Übersicht

Der Essenza Fragebogen ist ein mehrstufiger, benutzerfreundlicher Fragebogen für das Essenza-Produkt von Bio-eta. Er erfasst persönliche Daten, Gesundheitskategorien und Lebensstil-Informationen, um personalisierte Nahrungsergänzungsmittel zu empfehlen.

## Dateien

### Frontend
| Datei | Beschreibung |
|-------|--------------|
| `essenza-questionnaire.html` | Standalone HTML-Datei mit externen CSS/JS |
| `essenza-styles.css` | CSS-Styling mit Bio-eta Branding |
| `essenza-script.js` | JavaScript für Formularlogik |
| `essenza-shopify-embed.html` | Selbstenthaltene Version für Shopify |

### Backend (`essenza-backend/`)
| Datei | Beschreibung |
|-------|--------------|
| `server.js` | Express Server mit API-Endpunkten |
| `routes/questionnaire.js` | API-Routen für Fragebogen-Daten |
| `routes/webhooks.js` | Shopify Webhook-Handler |
| `services/shopify.js` | Shopify API Integration (Metafields) |
| `services/email.js` | E-Mail-Benachrichtigungen |
| `models/Questionnaire.js` | MongoDB Datenmodell |

## Features

- **4-Schritte Wizard**: Übersichtliche Navigation durch den Fragebogen
- **Fortschrittsanzeige**: Visuelle Fortschrittsleiste und Schritt-Indikatoren
- **Konditionale Logik**:
  - Schwangerschaftsfrage nur bei Geschlecht = weiblich
  - Kategorie-spezifische Fragen erscheinen nur für gewählte Kategorien
- **Validierung**: Pflichtfelder und E-Mail-Format-Prüfung
- **Responsive Design**: Optimiert für Desktop, Tablet und Mobile
- **Barrierefreiheit**: Semantisches HTML, fokussierbare Elemente

## Shopify Integration

### Option 1: Als Seite einbetten (Empfohlen)

1. Öffne Shopify Admin → Online Store → Pages
2. Klicke auf "Add page"
3. Klicke im Editor auf "Show HTML" (`<>` Button)
4. Kopiere den gesamten Inhalt von `essenza-shopify-embed.html`
5. Füge ihn ein und speichere die Seite

### Option 2: Als Section in Theme einbinden

1. Öffne Shopify Admin → Online Store → Themes
2. Klicke auf "Customize" → "Edit code"
3. Erstelle eine neue Section: `sections/essenza-questionnaire.liquid`
4. Füge den Code aus `essenza-shopify-embed.html` ein
5. Füge die Section in dein Template ein

### Option 3: Über Custom Liquid Block

Für Themes mit Liquid Blocks:
1. Theme Editor öffnen
2. Custom Liquid Block hinzufügen
3. Code aus `essenza-shopify-embed.html` einfügen

## Datenverarbeitung

### Event Listener

Der Fragebogen sendet ein Custom Event nach erfolgreicher Übermittlung:

```javascript
window.addEventListener('essenza-questionnaire-submitted', function(e) {
    const data = e.detail;
    console.log('Fragebogen-Daten:', data);

    // Weiterverarbeitung, z.B. an Backend senden
    fetch('/api/essenza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
});
```

### Datenstruktur

```javascript
{
    personal: {
        vorname: "Max",
        nachname: "Mustermann",
        email: "max@beispiel.de",
        geschlecht: "maennlich|weiblich|divers",
        schwangerschaft: "ja|nein|nicht_zutreffend",
        adresse: {
            strasse: "Musterstraße 1",
            plz: "12345",
            ort: "Berlin"
        },
        groesse: "180",
        gewicht: "75",
        aktivitaet: "7"
    },
    kategorien: ["mentale_gesundheit", "stress_schlaf", "immunsystem"],
    kategorie_antworten: {
        mentale_gesundheit: {
            konzentration: "6",
            vergessen: "4",
            muede: "7",
            laune: "5"
        },
        // ... weitere Kategorien
    },
    lebensstil: {
        familie_erkrankungen: "2",
        familie_herzinfarkt: "0",
        zigaretten: "0",
        kaffee: "3-4",
        freien: "1-2",
        alkohol: "1",
        ernaehrung: {
            milch: "40",
            fisch: "2",
            obst_gemuese: "60",
            fleisch: "4-7",
            weizen: "50",
            ballaststoffe: "50"
        }
    },
    timestamp: "2024-01-15T10:30:00.000Z"
}
```

### API-Anbindung (Backend)

Das Backend (`essenza-backend/`) bietet eine vollständige Lösung für:

1. **REST API** für Fragebogen-Einreichungen
2. **Shopify Integration** mit automatischer Kunden-Erstellung und Metafields
3. **Webhook Support** für Echtzeit-Updates
4. **E-Mail-Benachrichtigungen** für Kunden und Admin

#### Backend starten

```bash
cd essenza-backend
npm install
cp .env.example .env  # Konfiguration anpassen
npm run dev
```

#### Frontend konfigurieren

```html
<script>
window.EssenzaConfig = {
    apiEndpoint: 'https://your-backend.com/api/questionnaire',
    apiKey: null,  // Optional für zusätzliche Sicherheit
    enableLocalStorage: true,
    enableCustomEvent: true
};
</script>
<script src="essenza-script.js"></script>
```

#### API-Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| `POST` | `/api/questionnaire` | Fragebogen einreichen |
| `GET` | `/api/questionnaire/:id` | Fragebogen abrufen |
| `GET` | `/api/questionnaire/email/:email` | Nach E-Mail suchen |

#### Shopify Metafields

Die Fragebogen-Daten werden automatisch in Kunden-Metafields gespeichert:

```liquid
{% assign essenza = customer.metafields.essenza.questionnaire_data.value %}
{% if essenza %}
  <p>Kategorien: {{ essenza.kategorien | join: ', ' }}</p>
{% endif %}
```

Siehe `essenza-backend/README.md` für die vollständige Backend-Dokumentation.

## Anpassungen

### Farben ändern

Die Farben sind als CSS-Variablen definiert:

```css
:root {
    --primary-color: #2D5A27;     /* Hauptfarbe (Grün) */
    --primary-light: #4A7C43;     /* Helleres Grün */
    --primary-dark: #1E3D1A;      /* Dunkleres Grün */
    --secondary-color: #8FB573;   /* Sekundärfarbe */
    --accent-color: #C9A227;      /* Akzentfarbe (Gold) */
}
```

### Logo ändern

Im Header-Bereich:
```html
<div class="logo">
    <!-- Eigenes Logo einfügen -->
    <img src="ihr-logo.png" alt="Bio-eta" class="logo-image">
    <span class="product-name">Essenza</span>
</div>
```

### Fragen hinzufügen/ändern

Neue Fragen im entsprechenden Step hinzufügen:
```html
<div class="question-item">
    <label>Ihre neue Frage hier</label>
    <div class="slider-container">
        <input type="range" name="neue_frage" min="1" max="10" value="5" class="slider">
        <div class="slider-labels compact">
            <span>1</span>...<span>10</span>
        </div>
    </div>
</div>
```

## Browser-Unterstützung

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- iOS Safari 13+
- Android Chrome 80+

## Support

Bei Fragen zur Integration: info@bio-eta.de
