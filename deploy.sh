#!/bin/bash

# Deployment script for Divtrkr
# This script pulls latest changes, builds the project, and deploys to Firebase

set -e  # Exit on any error

echo "🚀 Starting deployment process..."
echo ""

# Step 1: Git pull
echo "📥 Pulling latest changes from git..."
git pull
echo "✅ Git pull completed"
echo ""

# Step 2: Install/update dependencies (optional, uncomment if needed)
# echo "📦 Installing dependencies..."
# npm install
# echo "✅ Dependencies updated"
# echo ""

# Step 3: Build the project
echo "🔨 Building project..."
npm run build
echo "✅ Build completed"
echo ""

# Step 4: Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy
echo "✅ Deployment completed"
echo ""

echo "🎉 Deployment successful! Your app is now live."