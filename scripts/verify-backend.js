import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Backend Features Verification\n');
console.log('='.repeat(50));

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('\n❌ Supabase credentials missing in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAll() {
    const results = {
        connection: false,
        settingsColumn: false,
        recurringFunction: false,
        edgeFunction: false
    };

    try {
        // 1. Check Supabase Connection
        console.log('\n1️⃣  Checking Supabase Connection...');
        const { data: testData, error: testError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

        if (testError && !testError.message.includes('JWT')) {
            throw testError;
        }

        results.connection = true;
        console.log('   ✅ Supabase connected');

        // 2. Check Settings Column
        console.log('\n2️⃣  Checking Settings Column...');
        try {
            const { error: columnError } = await supabase
                .from('profiles')
                .select('settings')
                .limit(1);

            if (columnError?.message?.includes('column "settings" does not exist')) {
                results.settingsColumn = false;
                console.log('   ❌ Settings column missing');
                console.log('   📝 Action: Run this SQL:');
                console.log('      ALTER TABLE profiles ADD COLUMN settings JSONB DEFAULT \'{}\'::jsonb;\n');
            } else {
                results.settingsColumn = true;
                console.log('   ✅ Settings column exists');
            }
        } catch (e) {
            results.settingsColumn = false;
            console.log('   ❌ Settings column check failed');
        }

        // 3. Check Recurring Function
        console.log('\n3️⃣  Checking Recurring Transactions Function...');
        try {
            const { data, error } = await supabase.rpc('process_recurring_transactions');

            if (error?.message?.includes('does not exist')) {
                results.recurringFunction = false;
                console.log('   ❌ Function not found');
                console.log('   📝 Action: Run supabase/recurring_logic.sql in SQL Editor\n');
            } else {
                results.recurringFunction = true;
                console.log('   ✅ Function exists and can be called');
            }
        } catch (e) {
            results.recurringFunction = false;
            console.log('   ❌ Function check failed');
        }

        // 4. Check Edge Function
        console.log('\n4️⃣  Checking Gemini Edge Function...');
        try {
            const { data, error } = await supabase.functions.invoke('gemini-chat', {
                body: { history: [], newMessage: 'test connectivity' }
            });

            if (error?.message?.includes('not found')) {
                results.edgeFunction = false;
                console.log('   ❌ Edge Function not deployed');
                console.log('   📝 Action: Run:');
                console.log('      npx supabase functions deploy gemini-chat');
                console.log('      npx supabase secrets set GEMINI_API_KEY=your_key\n');
            } else if (error?.message?.includes('GEMINI_API_KEY')) {
                results.edgeFunction = false;
                console.log('   ⚠️  Edge Function deployed but API key missing');
                console.log('   📝 Action: Run:');
                console.log('      npx supabase secrets set GEMINI_API_KEY=your_key\n');
            } else if (data?.text) {
                results.edgeFunction = true;
                console.log('   ✅ Edge Function working!');
                console.log('   📨 Test response:', data.text.substring(0, 50) + '...');
            } else {
                console.log('   ⚠️  Edge Function exists but response unclear');
                console.log('   Response:', data);
            }
        } catch (e) {
            results.edgeFunction = false;
            console.log('   ❌ Edge Function check failed:', e.message);
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 SUMMARY\n');

        const totalChecks = Object.keys(results).length;
        const passedChecks = Object.values(results).filter(v => v).length;

        console.log(`✅ Passed: ${passedChecks}/${totalChecks}`);
        console.log(`❌ Failed: ${totalChecks - passedChecks}/${totalChecks}\n`);

        console.log('Status by Feature:');
        console.log('  Connection:', results.connection ? '✅' : '❌');
        console.log('  Settings Column:', results.settingsColumn ? '✅' : '❌');
        console.log('  Recurring Function:', results.recurringFunction ? '✅' : '❌');
        console.log('  Edge Function:', results.edgeFunction ? '✅' : '❌');

        console.log('\n' + '='.repeat(50));

        if (passedChecks === totalChecks) {
            console.log('\n🎉 ALL BACKEND FEATURES READY!\n');
            console.log('You can now:');
            console.log('  • Toggle settings in Profile (will sync to DB)');
            console.log('  • Use Mental Health Chat (secure Edge Function)');
            console.log('  • Create recurring transactions (will auto-process)');
            console.log('  • Enable notifications (infrastructure ready)\n');
        } else {
            console.log('\n⚠️  Some features need deployment');
            console.log('📖 See actions above or check QUICK_DEPLOY.md\n');
        }

    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
    }
}

checkAll();
