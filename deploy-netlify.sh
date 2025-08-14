#!/bin/bash

echo "🚀 Building app..."
npm run build

echo "🚀 Deploying to Netlify..."
netlify deploy --prod
