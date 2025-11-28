import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to find API key
const envFiles = ['.env.local', '.env'];
let apiKey = '';

for (const file of envFiles) {
    const envPath = path.resolve(__dirname, file);
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(/VITE_GEMINI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
            console.log(`Found API key in ${file}`);
            break;
        }
    }
}

if (!apiKey) {
    console.error('No VITE_GEMINI_API_KEY found in .env.local or .env');
    process.exit(1);
}

console.log('Testing with API Key:', apiKey.substring(0, 8) + '...');

async function testDirectAPI() {
    try {
        // Test with v1 API
        console.log('\n=== Testing v1 API ===');
        const v1Url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const v1Response = await fetch(v1Url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Say hello' }] }]
            })
        });

        const v1Data = await v1Response.json();
        console.log('v1 Response status:', v1Response.status);
        if (v1Data.error) {
            console.log('v1 Error:', v1Data.error.message);
        } else {
            console.log('✓ v1 SUCCESS!');
            console.log('Response:', v1Data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text');
        }

        // Test with v1beta API
        console.log('\n=== Testing v1beta API ===');
        const v1betaUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const v1betaResponse = await fetch(v1betaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Say hello' }] }]
            })
        });

        const v1betaData = await v1betaResponse.json();
        console.log('v1beta Response status:', v1betaResponse.status);
        if (v1betaData.error) {
            console.log('v1beta Error:', v1betaData.error.message);
        } else {
            console.log('✓ v1beta SUCCESS!');
            console.log('Response:', v1betaData.candidates?.[0]?.content?.parts?.[0]?.text || 'No text');
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

testDirectAPI();
