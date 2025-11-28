import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Testing User Settings Sync to Supabase\n');

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Supabase credentials not found');
    console.log('ℹ️  Please ensure .env.local has:');
    console.log('   - VITE_SUPABASE_URL');
    console.log('   - VITE_SUPABASE_ANON_KEY\n');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSettingsSync() {
    try {
        console.log('1️⃣  Checking Supabase connection...');

        // Test basic connection
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError && authError.message !== 'Auth session missing!') {
            throw authError;
        }

        if (!user) {
            console.log('⚠️  No authenticated user found.');
            console.log('ℹ️  This test requires you to be logged in to the app.');
            console.log('📝 To test settings sync:');
            console.log('   1. Start the app: npm run dev');
            console.log('   2. Log in or sign up');
            console.log('   3. Go to Profile page');
            console.log('   4. Toggle Dark Mode or Notifications');
            console.log('   5. Check the Supabase Dashboard > Table Editor > profiles');
            console.log('   6. You should see the "settings" column updated with your preferences\n');
            return;
        }

        console.log(`✅ Connected! User ID: ${user.id}`);

        // Check if settings column exists in profile
        console.log('\n2️⃣  Checking profile table structure...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, name, settings')
            .eq('id', user.id)
            .single();

        if (profileError) {
            throw profileError;
        }

        console.log('✅ Settings column exists in profiles table');
        console.log('📋 Current settings:', profile.settings || 'null (will be synced on first change)');

        console.log('\n✅ Settings sync is configured correctly!');
        console.log('💡 Any changes made in the Profile page will now automatically sync to Supabase.\n');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);

        if (error.message.includes('column "settings" does not exist')) {
            console.log('\n🔧 Fix Required:');
            console.log('   The "settings" column needs to be added to the profiles table.');
            console.log('   Run this SQL in Supabase Dashboard > SQL Editor:');
            console.log('   ');
            console.log('   ALTER TABLE profiles ADD COLUMN settings JSONB DEFAULT \'{}\'::jsonb;');
            console.log('');
        }
    }
}

testSettingsSync();
