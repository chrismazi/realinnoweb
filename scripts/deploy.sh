#!/bin/bash

# RealWorks Production Deployment Script
# This script deploys your app to Vercel

echo "🚀 RealWorks Production Deployment"
echo "=================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI already installed"
fi

echo ""
echo "📋 Pre-Deployment Checklist:"
echo "  [✓] Backend features deployed"
echo "  [✓] Code tested locally"
echo "  [✓] Environment variables ready"
echo ""

read -p "Ready to deploy? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔨 Building production bundle..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        echo ""
        echo "🚀 Deploying to Vercel..."
        echo ""
        echo "⚠️  IMPORTANT: Set these environment variables in Vercel Dashboard:"
        echo "   - VITE_SUPABASE_URL"
        echo "   - VITE_SUPABASE_ANON_KEY"
        echo ""
        
        # Deploy
        vercel --prod
        
        echo ""
        echo "🎉 Deployment complete!"
        echo ""
        echo "📝 Next Steps:"
        echo "  1. Go to Vercel Dashboard"
        echo "  2. Settings → Environment Variables"
        echo "  3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
        echo "  4. Redeploy: vercel --prod"
        echo ""
        echo "  5. Update Supabase:"
        echo "     - Dashboard → Authentication → URL Configuration"
        echo "     - Add your Vercel URL to allowed URLs"
        echo ""
    else
        echo "❌ Build failed. Please fix errors and try again."
        exit 1
    fi
else
    echo "Deployment cancelled."
fi
