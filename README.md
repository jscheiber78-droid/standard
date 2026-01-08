# Biological Age Calculator for Shopify

A simple, embeddable biological age calculator webapp that can be integrated into any Shopify website.

## Features

- **Simple Interface**: Clean, user-friendly design
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Easy Integration**: Can be embedded directly into Shopify pages
- **Customizable**: Easy to modify colors and styling to match your brand
- **No Dependencies**: Pure HTML, CSS, and JavaScript

## What is Biological Age?

Biological age is an estimate of your body's age based on lifestyle factors, health metrics, and habits. Unlike chronological age (how many years you've been alive), biological age reflects how well your body is aging based on:

- Physical activity levels
- Diet and nutrition
- Sleep quality
- Stress levels
- Smoking and alcohol consumption
- Overall health markers

## Quick Start

1. Clone or download this repository
2. Open `index.html` in a web browser to test locally
3. Follow the Shopify integration guide below

## Files Included

- `index.html` - Main calculator interface
- `styles.css` - Styling and responsive design
- `script.js` - Calculation logic and interactivity
- `SHOPIFY_INTEGRATION.md` - Detailed Shopify integration guide

## Shopify Integration

### Method 1: Custom Page (Recommended)

1. In your Shopify admin, go to **Online Store > Pages**
2. Click **Add page**
3. Give it a title (e.g., "Biological Age Calculator")
4. Click the **Show HTML** button (`<>`)
5. Copy and paste the contents from `shopify-embed.html`
6. Save and publish

### Method 2: Theme Integration

1. Go to **Online Store > Themes**
2. Click **Actions > Edit code**
3. Create a new template or modify an existing page
4. Add the calculator code
5. Save changes

See `SHOPIFY_INTEGRATION.md` for detailed instructions.

## Customization

### Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #4CAF50;
    --secondary-color: #2196F3;
    --accent-color: #FF9800;
}
```

### Calculation Formula

Modify the calculation logic in `script.js` in the `calculateBiologicalAge()` function.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

MIT License - Feel free to use and modify for your Shopify store.

## Support

For issues or questions, please open an issue in the repository.
