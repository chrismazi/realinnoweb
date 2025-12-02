#!/bin/bash

# RealWorks Backend Deployment Script
# This script helps you deploy all backend features

echo "🚀 RealWorks Backend Deployment Helper"
echo "======================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI ready"
echo ""

# Step 1: Edge Function Deployment
echo "📋 Step 1: Deploy Edge Function"
echo "================================"
echo ""
echo "1️⃣  First, login to Supabase:"
echo "    npx supabase login"
echo ""
echo "2️⃣  Link your project:"
echo "    npx supabase link --project-ref YOUR_PROJECT_REF"
echo "    (Get YOUR_PROJECT_REF from your Supabase dashboard URL)"
echo ""
echo "3️⃣  Deploy the function:"
echo "    npx supabase functions deploy gemini-chat"
echo ""
echo "4️⃣  Set the API key secret:"
echo "    npx supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key"
echo ""
echo "Press Enter when done..."
read

# Step 2: Database Migration
echo ""
echo "📋 Step 2: Database Migration"
echo "============================="
echo ""
echo "1️⃣  Open Supabase Dashboard"
echo "2️⃣  Go to: SQL Editor"
echo "3️⃣  Click: New Query"
echo "4️⃣  Copy and paste contents of: supabase/recurring_logic.sql"
echo "5️⃣  Click: Run"
echo "6️⃣  Look for: Success message"
echo ""
echo "Press Enter when done..."
read

# Step 3: Verification
echo ""
echo "📋 Step 3: Verification Tests"
echo "=============================="
echo ""
echo "Test 1: Settings Column"
echo "Run this in SQL Editor:"
echo ""
echo "  SELECT column_name FROM information_schema.columns"
echo "  WHERE table_name = 'profiles' AND column_name = 'settings';"
echo ""
echo "Expected: Should return 'settings'"
echo ""
echo "Press Enter to continue..."
read

echo ""
echo "Test 2: Edge Function"
echo "Run this in your terminal:"
echo ""
echo "  npx supabase functions invoke gemini-chat --body '{\"history\":[],\"newMessage\":\"test\"}'"
echo ""
echo "Expected: Should return AI response"
echo ""
echo "Press Enter to continue..."
read

echo ""
echo "Test 3: Recurring Function"
echo "Run this in SQL Editor:"
echo ""
echo "  SELECT routine_name FROM information_schema.routines"
echo "  WHERE routine_name = 'process_recurring_transactions';"
echo ""
echo "Expected: Should return 'process_recurring_transactions'"
echo ""
echo "Press Enter to continue..."
read

echo ""
echo "🎉 Deployment Guide Complete!"
echo "=============================="
echo ""
echo "📝 Next Steps:"
echo "1. Start your app: npm run dev"
echo "2. Login to the app"
echo "3. Test Settings Sync: Toggle Dark Mode in Profile"
echo "4. Test Chat: Try Mental Health Chat"
echo "5. Check Supabase Dashboard to verify data"
echo ""
echo "📖 For detailed testing instructions, see:"
echo "   - TESTING_DEPLOYMENT_GUIDE.md"
echo "   - BACKEND_IMPLEMENTATION_SUMMARY.md"
echo ""
echo "✅ All backend features are ready!"
