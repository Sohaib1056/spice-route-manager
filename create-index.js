import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the dist/client directory to find the main JS and CSS files
const clientDir = path.join(__dirname, 'dist', 'client');
const assetsDir = path.join(clientDir, 'assets');

// Check if directories exist
if (!fs.existsSync(clientDir)) {
  console.error('❌ dist/client directory not found');
  process.exit(1);
}

if (!fs.existsSync(assetsDir)) {
  console.error('❌ dist/client/assets directory not found');
  process.exit(1);
}

// Find CSS and JS files
const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => f.endsWith('.css'));

// Find the main index JS file (the largest one, which is the entry point)
const indexFiles = files.filter(f => f.startsWith('index-') && f.endsWith('.js'));
let jsFile = null;
if (indexFiles.length > 0) {
  // Sort by file size descending and pick the largest
  jsFile = indexFiles
    .map(f => ({ name: f, size: fs.statSync(path.join(assetsDir, f)).size }))
    .sort((a, b) => b.size - a.size)[0].name;
}

console.log('📦 Found assets:');
console.log(`  CSS: ${cssFile || 'not found'}`);
console.log(`  JS: ${jsFile || 'not found'}`);

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
console.log('✅ index.html created successfully');
console.log(`📄 Location: ${path.join(clientDir, 'index.html')}`);
