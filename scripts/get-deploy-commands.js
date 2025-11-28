import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('\n🔍 Extracting Deployment Info from .env.local\n');
console.log('='.repeat(60));

// Get Supabase URL to extract project ref
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const geminiApiKey = process.env.VITE_GEMINI_API_KEY;

if (!supabaseUrl) {
    console.log('\n❌ VITE_SUPABASE_URL not found in .env.local\n');
    process.exit(1);
}

// Extract project ref from URL
// Format: https://xxxxx.supabase.co
const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectRef = match ? match[1] : null;

console.log('\n📋 DEPLOYMENT COMMANDS\n');
console.log('Copy and paste these commands one by one:\n');

console.log('─'.repeat(60));
console.log('\n1️⃣  LOGIN (if not done yet):\n');
console.log('   npx supabase login\n');

if (projectRef) {
    console.log('─'.repeat(60));
    console.log('\n2️⃣  LINK YOUR PROJECT:\n');
    console.log(`   npx supabase link --project-ref ${projectRef}\n`);
} else {
    console.log('─'.repeat(60));
    console.log('\n2️⃣  LINK YOUR PROJECT:\n');
    console.log('   ⚠️  Could not auto-detect project ref');
    console.log('   Get it from your Supabase dashboard URL');
    console.log('   npx supabase link --project-ref YOUR_PROJECT_REF\n');
}

console.log('─'.repeat(60));
console.log('\n3️⃣  DEPLOY FUNCTION:\n');
console.log('   npx supabase functions deploy gemini-chat\n');

if (geminiApiKey) {
    console.log('─'.repeat(60));
    console.log('\n4️⃣  SET API KEY SECRET:\n');
    console.log(`   npx supabase secrets set GEMINI_API_KEY="${geminiApiKey}"\n`);
} else {
    console.log('─'.repeat(60));
    console.log('\n4️⃣  SET API KEY SECRET:\n');
    console.log('   ⚠️  VITE_GEMINI_API_KEY not found in .env.local');
    console.log('   npx supabase secrets set GEMINI_API_KEY="your_key_here"\n');
}

console.log('─'.repeat(60));
console.log('\n5️⃣  VERIFY:\n');
console.log('   node scripts/verify-backend.js\n');

console.log('='.repeat(60));
console.log('\n💡 TIP: Copy each command and run it in your terminal\n');
