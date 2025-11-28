import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Testing Gemini Edge Function (Raw Fetch)\n');

async function testEdgeFunction() {
    try {
        const url = `${SUPABASE_URL}/functions/v1/gemini-chat`;
        console.log(`Calling: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                history: [],
                newMessage: 'Hello! Are you working?'
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        const text = await response.text();
        console.log('Raw Response Body:');
        console.log(text);

        try {
            const json = JSON.parse(text);
            if (json.text) {
                console.log('\n✅ SUCCESS! Valid JSON response received.');
            }
        } catch (e) {
            console.log('\n⚠️ Response is not valid JSON');
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

testEdgeFunction();
