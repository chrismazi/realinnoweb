import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🧪 Testing Gemini Edge Function\n');

async function testEdgeFunction() {
    try {
        console.log('Calling gemini-chat function...');

        const { data, error } = await supabase.functions.invoke('gemini-chat', {
            body: {
                history: [],
                newMessage: 'Hello! Are you working? Please respond briefly.'
            }
        });

        console.log('\n📋 Response:');
        console.log('Error:', error);
        console.log('Data:', JSON.stringify(data, null, 2));

        if (error) {
            console.log('\n❌ Function Error:', error.message);

            if (error.message.includes('not found')) {
                console.log('\n💡 The function may need a few more seconds to activate.');
                console.log('   Wait 30 seconds and try again.');
            }
        } else if (data?.text) {
            console.log('\n✅ SUCCESS! Edge Function is working!');
            console.log('📨 AI Response:', data.text);
        } else if (data === null) {
            console.log('\n⚠️  Function returned null');
            console.log('This might mean:');
            console.log('  1. The function was just deployed and needs time to activate');
            console.log('  2. There might be an error in the function code');
            console.log('  3. The API key might not be working');
            console.log('\n🔍 Check function logs at:');
            console.log(`  https://supabase.com/dashboard/project/${SUPABASE_URL.match(/https:\/\/([^.]+)/)[1]}/functions`);
        } else {
            console.log('\n⚠️  Unexpected response format');
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

testEdgeFunction();
