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

async function testModels() {
    const modelsToTest = [
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-2.0-flash-exp',
        'models/gemini-flash-latest',
        'models/gemini-pro-latest'
    ];

    for (const modelName of modelsToTest) {
        try {
            console.log(`\n=== Testing ${modelName} on v1beta ===`);
            const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Say hello' }] }]
                })
            });

            const data = await response.json();
            console.log('Response status:', response.status);
            if (data.error) {
                console.log('Error:', data.error.message || data.error);
            } else {
                console.log('✓ SUCCESS!');
                console.log('Response:', data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text');
                console.log('\n*** Working model found: ' + modelName + ' ***\n');
                return modelName; // Return the working model
            }
        } catch (e) {
            console.error('Exception:', e.message);
        }
    }

    console.log('\n❌ No working model found');
    return null;
}

testModels();
