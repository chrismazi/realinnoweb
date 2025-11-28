import { GoogleGenerativeAI } from '@google/generative-ai';
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

async function run() {
    try {
        console.log('Testing Gemini Flash model...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent('Hello! This is a test. Please respond with "I am online and ready to help!"');
        const response = await result.response;
        console.log('✓ Success! Response:', response.text());
    } catch (e) {
        console.error('✗ Error:', e.message);
    }
}

run();
