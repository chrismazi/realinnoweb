import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ Error: VITE_GEMINI_API_KEY not found in .env.local');
    process.exit(1);
}

console.log('🔄 Testing Gemini API Connection...');

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = "Hello, are you working? Reply with 'Yes, I am working!'";
        console.log(`📤 Sending prompt: "${prompt}"`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ Success! Response: "${text.trim()}"`);
        console.log('ℹ️  Note: This confirms your API key is valid. The Edge Function will use this same key.');
    } catch (error) {
        console.error('❌ Failed to connect to Gemini:', error.message);
    }
}

testGemini();
