# Essenza Fragebogen - Shopify Native Version

Diese Version läuft **direkt in Shopify** ohne externen Server. Die Daten werden in Cart Attributes gespeichert und sind bei jeder Bestellung verfügbar.

## Installation

### 1. Dateien kopieren

Kopiere die Dateien in dein Shopify Theme:

```
shopify-native/
├── sections/essenza-questionnaire.liquid  →  theme/sections/
├── snippets/essenza-slider-question.liquid →  theme/snippets/
└── assets/essenza-native.css              →  theme/assets/
```

### 2. Im Shopify Admin

1. **Online Store** → **Themes** → **Edit code**
2. Erstelle die Dateien in den entsprechenden Ordnern
3. Oder nutze die Shopify CLI: `shopify theme push`

### 3. Section einbinden

**Option A: Im Theme Editor**
1. Gehe zu einer Seite im Theme Editor
2. Klicke "Add section"
3. Wähle "Essenza Fragebogen"

**Option B: In einem Template**
```liquid
{% section 'essenza-questionnaire' %}
```

**Option C: Auf einer eigenen Seite**
1. Erstelle ein neues Template: `templates/page.essenza.json`
```json
{
  "sections": {
    "main": {
      "type": "essenza-questionnaire"
    }
  },
  "order": ["main"]
}
```
2. Erstelle eine Seite und wähle "essenza" als Template

## Wie es funktioniert

### Datenspeicherung (ohne Server)

1. **localStorage** - Zwischenspeicherung und Fortschritt
2. **Cart Attributes** - Werden zur Bestellung hinzugefügt
3. **Cart Note** - Zusammenfassung für Admin sichtbar

### Bei Bestellung sichtbar

Die Fragebogen-Daten erscheinen automatisch:
- In der Bestellübersicht im Admin
- In der Bestellbestätigungs-E-Mail
- Als Order Attributes in der API

### Cart Attributes

| Attribut | Inhalt |
|----------|--------|
| `essenza_submission_id` | Eindeutige Referenznummer |
| `essenza_kategorien` | Gewählte Kategorien |
| `essenza_name` | Kundenname |
| `essenza_email` | E-Mail-Adresse |
| `essenza_data` | Komprimierte Zusatzdaten |

## Daten in Liquid verwenden

### In Order Templates

```liquid
{% if order.note contains 'ESSENZA FRAGEBOGEN' %}
  <div class="essenza-order-info">
    <h3>Essenza Fragebogen</h3>
    <p>{{ order.note }}</p>
  </div>
{% endif %}

{% for attr in order.attributes %}
  {% if attr.first contains 'essenza' %}
    <p><strong>{{ attr.first }}:</strong> {{ attr.last }}</p>
  {% endif %}
{% endfor %}
```

### In Cart

```liquid
{% if cart.attributes.essenza_submission_id %}
  <p>Essenza-Fragebogen ausgefüllt: {{ cart.attributes.essenza_kategorien }}</p>
{% endif %}
```

## JavaScript API

```javascript
// Fragebogen-Daten abrufen
const data = EssenzaQuestionnaire.getData();

// Submission ID abrufen
const id = EssenzaQuestionnaire.getSubmissionId();

// Fragebogen zurücksetzen
EssenzaQuestionnaire.reset();

// Event Listener für Absendung
window.addEventListener('essenza:submitted', (e) => {
  console.log('Fragebogen abgesendet:', e.detail);
});
```

## Section Settings

Im Theme Editor konfigurierbar:

| Setting | Beschreibung |
|---------|--------------|
| `contact_email` | Kontakt-E-Mail im Footer |
| `essenza_product_handle` | Produkt-Link nach Absendung |

## Anpassungen

### Farben ändern

In `assets/essenza-native.css`:

```css
:root {
  --essenza-primary: #2D5A27;      /* Hauptfarbe */
  --essenza-primary-light: #4A7C43;
  --essenza-secondary: #8FB573;
  --essenza-accent: #C9A227;       /* Akzent (Gold) */
}
```

### Fragen hinzufügen

In `sections/essenza-questionnaire.liquid`, nutze das Snippet:

```liquid
{% render 'essenza-slider-question',
   name: 'neue_frage',
   label: 'Deine neue Frage hier?' %}
```

## Einschränkungen

- Daten werden erst bei Bestellung dauerhaft gespeichert
- Keine Server-seitige Validierung
- Keine automatischen E-Mails (nutze Shopify Flow oder Apps)
- Metafields erfordern Shopify Plus oder eine App

## Für Shopify Plus

Mit Shopify Plus kannst du zusätzlich:
- Checkout Scripts für Validierung nutzen
- Customer Metafields direkt schreiben
- Shopify Flow für automatische E-Mails

## Support

Bei Fragen: info@bio-eta.de
