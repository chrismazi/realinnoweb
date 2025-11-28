import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read API key
const envPath = path.resolve(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf-8');
const match = content.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match[1].trim();

console.log('Testing FINAL configuration...\n');

async function testFinalConfig() {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'models/gemini-flash-latest' });

        const result = await model.generateContent('Hello! Please introduce yourself.');
        const response = await result.response;
        console.log('✅ SUCCESS! The chat is now working!\n');
        console.log('Vestie says:', response.text());
        console.log('\n📝 Model used: models/gemini-flash-latest');
        console.log('🔧 Library version: 0.21.0');
        console.log('\n✨ You can now use the AI chat in your WellVest app!');
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

testFinalConfig();
