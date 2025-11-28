import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔧 WellVest Login Helper\n');
console.log('='.repeat(60));

async function checkLoginStatus() {
    console.log('\n1️⃣  Checking current session...\n');

    const { data: { session }, error } = await supabase.auth.getSession();

    if (session) {
        console.log('✅ You are currently logged in!');
        console.log(`📧 Email: ${session.user.email}`);
        console.log(`🆔 User ID: ${session.user.id}`);
        console.log(`⏰ Session Expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);

        console.log('\n To logout, run this in browser console:');
        console.log('   localStorage.clear(); location.reload();');
    } else {
        console.log('⚠️  No active session found.');
        console.log('\n📝 To login, you can:');
        console.log('   1. Open http://localhost:3000');
        console.log('   2. Click "Sign Up" if you don\'t have an account');
        console.log('   3. Or click "Sign In" with existing credentials');

        console.log('\n🔑 Test Account (if you want to create one):');
        console.log('   Email: test@wellvest.app');
        console.log('   Password: TestPass123!');
        console.log('\n   Run: node scripts/create-test-user.js');
    }
}

checkLoginStatus();
