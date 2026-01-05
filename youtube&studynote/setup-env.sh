#!/bin/bash

# ==============================================
# SETUP SCRIPT - Environment Files Configuration
# ==============================================
# This script helps you set up environment files for different deployments
# Usage: bash setup-env.sh

echo "
╔══════════════════════════════════════════════════════╗
║   ENVIRONMENT SETUP SCRIPT                           ║
╚══════════════════════════════════════════════════════╝
"

cd backend

# Check if environment files exist
echo "📁 Checking environment files..."

if [ -f ".env.development" ]; then
    echo "✅ .env.development exists"
else
    echo "❌ .env.development missing"
fi

if [ -f ".env.staging" ]; then
    echo "✅ .env.staging exists"
else
    echo "❌ .env.staging missing"
fi

if [ -f ".env.production" ]; then
    echo "✅ .env.production exists"
else
    echo "❌ .env.production missing"
fi

if [ -f "env-loader.js" ]; then
    echo "✅ env-loader.js exists"
else
    echo "❌ env-loader.js missing"
fi

echo ""
echo "📋 Select setup option:"
echo "1) Setup for Development"
echo "2) Setup for Staging"
echo "3) Setup for Production"
echo "4) Check environment status"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🛠️ Setting up Development Environment..."
        if [ -f ".env.development" ]; then
            cp .env.development .env
            echo "✅ Copied .env.development to .env"
            echo ""
            echo "🔧 Environment variables loaded:"
            grep "^[^#]" .env | head -5
            echo "..."
        else
            echo "❌ .env.development not found"
        fi
        ;;
    2)
        echo ""
        echo "🛠️ Setting up Staging Environment..."
        echo "⚠️  You need to update .env.staging with your staging MongoDB credentials"
        echo ""
        echo "Edit .env.staging and set:"
        echo "  MONGODB_CLOUD=mongodb+srv://username:password@cluster.mongodb.net/dbname"
        echo "  JWT_SECRET=your-staging-secret"
        echo ""
        if [ -f ".env.staging" ]; then
            cp .env.staging .env
            echo "✅ Copied .env.staging to .env"
        else
            echo "❌ .env.staging not found"
        fi
        ;;
    3)
        echo ""
        echo "🛠️ Setting up Production Environment..."
        echo "⚠️  IMPORTANT: Update .env.production with your production MongoDB credentials"
        echo ""
        echo "Edit .env.production and set:"
        echo "  MONGODB_CLOUD=mongodb+srv://username:password@cluster.mongodb.net/dbname"
        echo "  JWT_SECRET=your-production-secret"
        echo "  FRONTEND_URL=https://your-production-domain.com"
        echo ""
        if [ -f ".env.production" ]; then
            cp .env.production .env
            echo "✅ Copied .env.production to .env"
        else
            echo "❌ .env.production not found"
        fi
        ;;
    4)
        echo ""
        echo "📊 Environment Status:"
        if [ -f ".env" ]; then
            echo "✅ .env file exists"
            echo ""
            echo "Current NODE_ENV:"
            grep "^NODE_ENV=" .env || echo "Not set"
            echo ""
            echo "Current Database:"
            grep "^DB_ENVIRONMENT=" .env || echo "Not set"
        else
            echo "❌ .env file not found"
            echo "Run this script and select option 1, 2, or 3"
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        ;;
esac

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review the environment file"
echo "2. Update credentials if needed"
echo "3. Run: npm run dev:watch"
echo ""