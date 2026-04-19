const fs = require('fs');
const path = require('path');

// Read the dist/client directory to find the main JS and CSS files
const clientDir = path.join(__dirname, 'dist', 'client');
const assetsDir = path.join(clientDir, 'assets');

// Find CSS and JS files
const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));
const jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'));

// Create index.html
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/jpeg" href="/assets/images/logo.jpg">
  <meta name="theme-color" content="#D4860A">
  <title>DryFruit Pro — Dry Fruit Management System</title>
  <meta name="description" content="Premium dry fruit wholesale & retail management system">
  ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}">` : ''}
</head>
<body>
  <div id="root"></div>
  ${jsFile ? `<script type="module" src="/assets/${jsFile}"></script>` : ''}
</body>
</html>`;

// Write index.html
fs.writeFileSync(path.join(clientDir, 'index.html'), html);
console.log('✓ index.html created successfully');
console.log(`  CSS: ${cssFile || 'not found'}`);
console.log(`  JS: ${jsFile || 'not found'}`);
