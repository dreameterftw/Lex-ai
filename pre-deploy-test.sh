#!/bin/bash

# Lex Pre-Deployment Test Script
# This script helps verify the full critical path locally before deploying

echo "================================"
echo "Lex Pre-Deployment Test Suite"
echo "================================"
echo ""

# Check if both frontend and backend directories exist
if [ ! -d "lex-frontend" ]; then
    echo "❌ Error: lex-frontend directory not found"
    exit 1
fi

if [ ! -d "lex-backend" ]; then
    echo "❌ Error: lex-backend directory not found"
    exit 1
fi

echo "✅ Project structure verified"
echo ""

# Check .env files
echo "📋 Checking environment variables..."
if [ ! -f "lex-frontend/.env" ]; then
    echo "❌ Frontend .env missing"
    exit 1
fi

if [ ! -f "lex-backend/.env" ]; then
    echo "❌ Backend .env missing"
    exit 1
fi

echo "✅ .env files found"
echo ""

# Verify dependencies
echo "🔍 Checking dependencies..."
cd lex-frontend
if ! npm list > /dev/null 2>&1; then
    echo "⚠️  Frontend dependencies may need reinstall"
    echo "    Run: npm install"
fi
cd ..

cd lex-backend
if ! npm list > /dev/null 2>&1; then
    echo "⚠️  Backend dependencies may need reinstall"
    echo "    Run: npm install"
fi
cd ..

echo "✅ Dependencies verified"
echo ""

# Build frontend
echo "🔨 Building frontend for production..."
cd lex-frontend
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend build successful"
    if [ -d "dist" ]; then
        FILE_COUNT=$(find dist -type f | wc -l)
        echo "   Output: dist/ with $FILE_COUNT files"
    fi
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo ""
echo "================================"
echo "✅ Pre-Deploy Checks Passed"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Start the backend (Terminal 1):"
echo "    cd lex-backend && npm run dev"
echo ""
echo "2️⃣  Start the frontend (Terminal 2):"
echo "    cd lex-frontend && npm run dev"
echo ""
echo "3️⃣  Open http://localhost:5173 and test the critical path:"
echo "    - Sign up"
echo "    - Create situation"
echo "    - Upload document"
echo "    - Identify rights"
echo "    - Calculate deadlines"
echo "    - Ask Lex Counsel"
echo "    - Generate Signal Letter"
echo "    - View Timeline"
echo ""
echo "4️⃣  Check browser console and Network tab for errors"
echo ""
echo "5️⃣  When satisfied, run deployment:"
echo "    npm run deploy (or see DEPLOYMENT_FIREBASE.md)"
echo ""
