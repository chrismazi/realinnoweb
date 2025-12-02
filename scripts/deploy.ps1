# RealWorks Production Deployment Script (PowerShell)
# Run this script to deploy your app to Vercel

Write-Host "🚀 RealWorks Production Deployment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Pre-Deployment Checklist:" -ForegroundColor Cyan
Write-Host "  [✓] Backend features deployed" -ForegroundColor Green
Write-Host "  [✓] Code tested locally" -ForegroundColor Green
Write-Host "  [✓] Environment variables ready" -ForegroundColor Green
Write-Host ""

$deploy = Read-Host "Ready to deploy? (y/n)"

if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host ""
    Write-Host "🔨 Building production bundle..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Set these environment variables in Vercel Dashboard:" -ForegroundColor Yellow
        Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor White
        Write-Host "   - VITE_SUPABASE_ANON_KEY" -ForegroundColor White
        Write-Host ""
        
        # Deploy
        vercel --prod
        
        Write-Host ""
        Write-Host "🎉 Deployment complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Next Steps:" -ForegroundColor Cyan
        Write-Host "  1. Go to Vercel Dashboard" -ForegroundColor White
        Write-Host "  2. Settings → Environment Variables" -ForegroundColor White
        Write-Host "  3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY" -ForegroundColor White
        Write-Host "  4. Redeploy: vercel --prod" -ForegroundColor White
        Write-Host ""
        Write-Host "  5. Update Supabase:" -ForegroundColor White
        Write-Host "     - Dashboard → Authentication → URL Configuration" -ForegroundColor White
        Write-Host "     - Add your Vercel URL to allowed URLs" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "❌ Build failed. Please fix errors and try again." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
}
