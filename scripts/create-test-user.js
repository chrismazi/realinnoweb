import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('👤 Creating Test User for WellVest\n');
console.log('='.repeat(60));

async function createTestUser() {
    const testEmail = 'wellvest.test@gmail.com';
    const testPassword = 'TestPass123!';
    const testName = 'Test User';

    console.log(`\n📧 Email: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword}`);
    console.log(`👤 Name: ${testName}\n`);

    try {
        console.log('Creating user account...');

        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    name: testName
                }
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                console.log('\n✅ User already exists!');
                console.log('\n📝 You can login with:');
                console.log(`   Email: ${testEmail}`);
                console.log(`   Password: ${testPassword}`);
                console.log('\nGo to http://localhost:3000 and use these credentials.');
            } else {
                console.log('\n❌ Error:', error.message);
            }
        } else if (data.user) {
            console.log('\n✅ Test user created successfully!');
            console.log(`🆔 User ID: ${data.user.id}`);
            console.log(`📧 Email: ${data.user.email}`);

            console.log('\n📝 Login Credentials:');
            console.log(`   Email: ${testEmail}`);
            console.log(`   Password: ${testPassword}`);

            console.log('\n⚠️  Note: Check your email for verification link');
            console.log('   (or check Supabase Dashboard if email confirmations are disabled)');

            console.log('\n✅ You can now login at: http://localhost:3000');
        }
    } catch (error) {
        console.log('\n❌ Failed:', error.message);
    }
}

createTestUser();
