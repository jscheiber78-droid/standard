# Shopify Integration Guide

This guide provides detailed instructions for integrating the Biological Age Calculator into your Shopify store.

## Table of Contents

1. [Quick Integration (Recommended)](#quick-integration-recommended)
2. [Advanced Integration](#advanced-integration)
3. [Customization](#customization)
4. [Troubleshooting](#troubleshooting)

## Quick Integration (Recommended)

This method is the easiest and works for most Shopify stores.

### Step 1: Create a New Page

1. Log in to your Shopify Admin
2. Navigate to **Online Store > Pages**
3. Click the **Add page** button

### Step 2: Set Up the Page

1. Enter a title for your page (e.g., "Biological Age Calculator" or "Find Your True Age")
2. In the content editor, click the **Show HTML** button (looks like `<>`)
3. Delete any existing content in the HTML editor

### Step 3: Add the Calculator Code

1. Open the `shopify-embed.html` file from this repository
2. Copy the entire contents
3. Paste it into the HTML editor in Shopify
4. Click **Save**

### Step 4: Publish and Test

1. Click **View page** to see your calculator in action
2. Test the calculator to ensure it works correctly
3. If satisfied, publish the page

### Step 5: Add to Navigation (Optional)

1. Go to **Online Store > Navigation**
2. Click on your main menu (usually "Main menu")
3. Click **Add menu item**
4. Enter a title (e.g., "Age Calculator")
5. In the link field, search for and select your new page
6. Click **Add** and then **Save menu**

## Advanced Integration

### Method 1: Custom Theme Section

For developers who want to integrate the calculator directly into their theme:

1. Go to **Online Store > Themes**
2. Click **Actions > Edit code**
3. In the **Sections** directory, click **Add a new section**
4. Name it `biological-age-calculator.liquid`
5. Paste the contents from `shopify-embed.html`
6. Save the file

Now you can add this section to any page using the theme customizer.

### Method 2: Snippet Integration

For adding the calculator to specific product pages or blog posts:

1. Go to **Online Store > Themes > Actions > Edit code**
2. In the **Snippets** directory, click **Add a new snippet**
3. Name it `age-calculator`
4. Paste the contents from `shopify-embed.html`
5. Save the file

To use the snippet, add this code where you want the calculator to appear:

```liquid
{% render 'age-calculator' %}
```

### Method 3: App Embed Block

For Shopify 2.0 themes with app blocks:

1. Create a new app block file in your theme
2. Add the calculator code
3. Enable it through the theme customizer

## Customization

### Changing Colors

The calculator uses CSS variables for easy color customization. Add this code to the `<style>` section in your Shopify page:

```css
:root {
    --primary-color: #YOUR_COLOR_HERE;
    --secondary-color: #YOUR_COLOR_HERE;
    --accent-color: #YOUR_COLOR_HERE;
}
```

### Matching Your Brand

1. **Primary Color**: Change `--primary-color` to match your brand color
2. **Secondary Color**: Use a complementary color for gradients
3. **Font**: The calculator uses system fonts by default, but you can change the font-family

Example:

```css
body {
    font-family: 'Your Brand Font', sans-serif;
}
```

### Adjusting Size

To make the calculator wider or narrower, modify the max-width:

```css
.calculator-container {
    max-width: 900px; /* Default is 700px */
}
```

### Hiding Elements

To hide the disclaimer or any other element:

```css
.disclaimer {
    display: none;
}
```

## Embedding in Specific Locations

### Product Page

1. Go to **Online Store > Themes > Actions > Edit code**
2. Open `sections/product-template.liquid` (or similar)
3. Find where you want to add the calculator
4. Add: `{% render 'age-calculator' %}`

### Homepage

1. Use the theme customizer
2. Add a custom HTML section
3. Paste the calculator code

### Blog Post

1. Create or edit a blog post
2. Switch to HTML view (`<>`)
3. Paste the calculator code

## Responsive Design

The calculator is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones

No additional configuration needed!

## SEO Optimization

To improve SEO for your calculator page:

1. Add a meta description in Shopify:
   - While editing the page, scroll down to **Search engine listing preview**
   - Click **Edit website SEO**
   - Add a description like: "Calculate your biological age based on lifestyle factors. Free health assessment tool."

2. Use a clear, descriptive title
3. Add relevant tags (e.g., "health", "wellness", "calculator")

## Performance Tips

1. **Load Time**: The calculator is lightweight and loads quickly
2. **No External Dependencies**: Everything is self-contained
3. **Mobile Optimized**: Fast performance on mobile devices

## Privacy Considerations

Important: This calculator does NOT:

- Store user data
- Send information to external servers
- Use cookies
- Track users

All calculations are performed locally in the user's browser.

## Troubleshooting

### Calculator Not Displaying

1. Ensure you're in HTML mode when pasting the code
2. Check that JavaScript is enabled in your Shopify theme settings
3. Clear your browser cache and refresh

### Styling Issues

1. Check if your theme has conflicting CSS
2. Try adding `!important` to custom styles
3. Ensure the `<style>` tag is included

### Button Not Working

1. Verify that the `<script>` tag is included
2. Check browser console for JavaScript errors
3. Ensure there are no JavaScript conflicts with other apps

### Mobile Display Problems

1. The calculator should be responsive by default
2. If issues occur, check your theme's viewport settings
3. Ensure no theme CSS is overriding the calculator styles

## Testing Checklist

Before going live, test the following:

- [ ] Calculator displays correctly on desktop
- [ ] Calculator displays correctly on mobile
- [ ] All form fields are functional
- [ ] Calculation produces results
- [ ] Results are accurate
- [ ] "Calculate Again" button works
- [ ] Page loads quickly
- [ ] Colors match your brand
- [ ] No JavaScript errors in console

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the code in `shopify-embed.html`
3. Open an issue in the repository
4. Contact Shopify support for theme-specific issues

## Advanced Customization

### Adding Google Analytics Tracking

To track calculator usage:

```javascript
form.addEventListener('submit', function(e) {
    // Existing code...

    // Add tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', 'calculator_submit', {
            'event_category': 'engagement',
            'event_label': 'biological_age_calculator'
        });
    }
});
```

### Collecting Email Addresses

If you want to collect emails (requires Shopify's customer API):

1. Add an email field to the form
2. Implement email collection logic
3. Ensure GDPR compliance

### A/B Testing

To test different versions:

1. Create multiple pages with variations
2. Use Shopify's built-in analytics
3. Track conversion rates

## Best Practices

1. **Placement**: Put the calculator on a dedicated page for best results
2. **Marketing**: Promote the calculator in email campaigns and social media
3. **Call-to-Action**: Add relevant product links after results (e.g., health supplements)
4. **Updates**: Regularly review and update the calculation formula based on latest research

## Legal Disclaimer

Always include a medical disclaimer. The default disclaimer is included in the calculator, but consult with a lawyer for your specific jurisdiction.

## Next Steps

After integration:

1. Test thoroughly on all devices
2. Promote your new calculator
3. Monitor usage analytics
4. Consider adding related products or services
5. Collect customer feedback

## Additional Resources

- [Shopify Page Editor Documentation](https://help.shopify.com/en/manual/online-store/pages)
- [Shopify Theme Customization](https://help.shopify.com/en/manual/online-store/themes/customizing-themes)
- [Shopify Liquid Documentation](https://shopify.dev/docs/themes/liquid/reference)
