/**
 * CORS Test Script
 * Run this to test if your backend CORS is working
 * 
 * Usage: node test-cors.js
 */

const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'https://spice-route-manager-production.up.railway.app';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://spice-route-manager.vercel.app';

console.log('🧪 Testing CORS Configuration...\n');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Frontend Origin: ${FRONTEND_ORIGIN}\n`);

// Test 1: Health Check
console.log('Test 1: Health Check (GET /)');
https.get(BACKEND_URL, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`✅ CORS Headers:`);
  console.log(`   - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NOT SET'}`);
  console.log(`   - Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'NOT SET'}`);
  console.log(`   - Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'NOT SET'}`);
  console.log('');
  
  // Test 2: Preflight Request (OPTIONS)
  console.log('Test 2: Preflight Request (OPTIONS /api/products)');
  const options = {
    method: 'OPTIONS',
    hostname: new URL(BACKEND_URL).hostname,
    path: '/api/products',
    headers: {
      'Origin': FRONTEND_ORIGIN,
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'content-type'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    console.log(`✅ CORS Headers:`);
    console.log(`   - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NOT SET'}`);
    console.log(`   - Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'NOT SET'}`);
    console.log(`   - Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'NOT SET'}`);
    console.log(`   - Access-Control-Max-Age: ${res.headers['access-control-max-age'] || 'NOT SET'}`);
    console.log('');
    
    if (res.statusCode === 204 && res.headers['access-control-allow-origin']) {
      console.log('✅ CORS is properly configured!');
      console.log('✅ Your frontend should be able to make requests to the backend.');
    } else {
      console.log('❌ CORS configuration issue detected!');
      console.log('❌ Check the backend CORS settings.');
    }
  });
  
  req.on('error', (e) => {
    console.error(`❌ Error: ${e.message}`);
  });
  
  req.end();
}).on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
});
