# Firebase Environment Configuration Guide

This guide explains how to properly configure Firebase environment variables for different deployment environments to avoid warnings about using development configuration in production.

## Issue Addressed

The warning message:

src-C0jcwm4_.js:sourcemap:2 ⚠️ Using development Firebase config in production environment! Set proper environment variables.

This occurs when the application is running in a production environment but is using Firebase configuration meant for development.

## Solution

We've implemented a solution that:

1. Uses development Firebase configuration in development mode
2. Strictly requires environment variables in production mode
3. Prevents fallback to development configuration in production

## Setting Up Environment Variables

### Development Environment

For local development, you can continue using the `.env` file with your development Firebase configuration. The application will automatically use this configuration in development mode.

### Production Environment

For production deployment, you must set up proper environment variables:

1. Use the `.env.production` template file as a guide
2. Fill in your production Firebase configuration values
3. Configure your deployment platform to use these values

#### Required Firebase Variables for Production

VITE_FIREBASE_API_KEY=your-production-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-production-auth-domain
VITE_FIREBASE_DATABASE_URL=your-production-database-url
VITE_FIREBASE_PROJECT_ID=your-production-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-production-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-production-messaging-sender-id
VITE_FIREBASE_APP_ID=your-production-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-production-measurement-id

## Deployment Platform Instructions

### Vercel

1. In your Vercel dashboard, go to your project settings
2. Navigate to the "Environment Variables" section
3. Add each Firebase configuration variable from your `.env.production` file
4. Make sure to select "Production" for the environment
5. Click "Save" to apply the changes
6. Redeploy your application

### Netlify

1. In your Netlify dashboard, go to your site settings
2. Navigate to "Build & Deploy" → "Environment Variables"
3. Add each Firebase configuration variable from your `.env.production` file
4. Click "Save" to apply the changes
5. Trigger a new deployment

### Other Hosting Providers

For other hosting providers, refer to their documentation on setting environment variables for your application. Always ensure that:

1. The environment variables are accessible to the application at build time
2. The variable names match exactly what the application expects (VITE_FIREBASE_*)
3. You're using production Firebase credentials in production environments

## Testing Your Configuration

After deployment, verify that your application is using the correct Firebase configuration by:

1. Opening your deployed application
2. Checking the browser console for any Firebase configuration warnings
3. Verifying that Firebase functionality works as expected

If you still see the warning about using development configuration in production, double-check that your environment variables are properly set and that they're being correctly loaded by your application.

## Best Practices

1. **Never hardcode** Firebase credentials directly in your code
2. **Use separate Firebase projects** for development and production
3. **Restrict your Firebase Security Rules** appropriately for each environment
4. **Regularly rotate** your Firebase API keys for enhanced security
5. **Don't commit** `.env` or `.env.production` files with actual credentials to your repository
