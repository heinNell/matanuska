# Deployment Debugging Guide

## 🔍 Identifying Blank Screen Issues

Your application builds clean locally but shows blank screens in production. This guide will help you systematically identify and fix the issue.

## 📋 Checklist for Blank Screen Deployment Issues

### 1. Browser Console Errors
Open browser dev tools (F12) and check the Console tab for:
- **Red error messages** (critical)
- **404 errors** for missing files
- **Import/module errors**
- **Environment variable issues**

### 2. Network Tab Issues
Check the Network tab for:
- **Failed resource loads** (JS, CSS files)
- **404 errors** for chunks or assets
- **CORS errors**
- **Base URL/routing issues**

### 3. Environment Variables
The most common cause of blank screens is missing environment variables:

#### Required Variables (check your deployment platform):
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Check Environment Variables in Production:
1. Open browser dev tools
2. Go to Console tab
3. Type: `window.env` or check the DeploymentFallback component we added

### 4. Routing Configuration
For SPAs (Single Page Applications), ensure your deployment platform is configured for client-side routing:

#### Netlify (_redirects file):
```
/*    /index.html   200
```

#### Vercel (vercel.json):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Apache (.htaccess):
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 5. Base URL Issues
Check if your app is deployed to a subdirectory:
- Update `vite.config.ts` with correct `base` path
- Ensure all asset paths are relative or absolute

## 🛠️ Debugging Steps

### Step 1: Check Production Console
1. Open your deployed app
2. Press F12 to open dev tools
3. Look for errors in Console tab
4. Screenshot any errors and check them against this guide

### Step 2: Verify Environment Variables
Your app now includes a debugging fallback. If you see the deployment fallback page:
1. Check which environment variables are missing
2. Add them to your deployment platform
3. Redeploy

### Step 3: Test Local Production Build
```bash
npm run build
npm run preview
```
This tests the production build locally to isolate deployment-specific issues.

### Step 4: Check Asset Loading
If you see a white screen:
1. Check Network tab for 404 errors
2. Verify all JS/CSS chunks are loading
3. Check if the base URL is correct

## 🔧 Common Solutions

### Solution 1: Environment Variables
Most blank screens are caused by missing Firebase configuration:
1. Go to your deployment platform (Netlify, Vercel, etc.)
2. Add all required VITE_* environment variables
3. Redeploy

### Solution 2: Routing Configuration
Add proper SPA routing configuration to your deployment platform.

### Solution 3: Base URL Configuration
If deployed to a subdirectory, update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/your-subdirectory/',
  // ... other config
});
```

### Solution 4: Clear Cache
Sometimes deployment caches cause issues:
1. Clear browser cache
2. Clear deployment platform cache
3. Force refresh (Ctrl+Shift+R)

## 📊 Debugging Components Added

Your app now includes:
- **DeploymentFallback.tsx**: Shows environment status and troubleshooting info
- **Enhanced error boundaries**: Better error catching and display
- **Improved initialization**: Better service startup order

## 🚀 Deployment Platform Specific

### Netlify
1. Check Build & Deploy settings
2. Verify environment variables in Site settings
3. Ensure _redirects file is in place

### Vercel
1. Check Environment Variables in dashboard
2. Verify vercel.json configuration
3. Check build logs for errors

### Firebase Hosting
1. Ensure firebase.json has proper rewrites
2. Check Firebase project configuration
3. Verify hosting rules

## 📞 Next Steps

1. **First**: Check browser console for errors
2. **Second**: Verify environment variables are set in deployment
3. **Third**: Ensure proper SPA routing configuration
4. **Fourth**: Test local production build

## 🐛 Getting Help

If you're still seeing blank screens:
1. Share browser console errors
2. Share Network tab screenshots
3. Confirm which deployment platform you're using
4. Verify environment variables are properly set

The debugging tools we've added should help identify the exact issue!
