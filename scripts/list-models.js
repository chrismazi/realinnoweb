import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const API_KEY = process.env.VITE_GEMINI_API_KEY;

console.log('🔍 Checking available Gemini models...\n');

async function listModels() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Available Models:');
        data.models.forEach(m => {
            if (m.name.includes('gemini')) {
                console.log(`- ${m.name.replace('models/', '')}`);
            }
        });

    } catch (error) {
        console.error('❌ Failed to list models:', error.message);
    }
}

listModels();
