# Netlify to Vercel Migration Guide

This document explains the process of migrating the APppp application from Netlify to Vercel.

## Migration Status

✅ **Completed**:
- Created Vercel configuration files (`vercel.json`, `.vercelignore`)
- Added Vercel deployment scripts to `package.json`
- Created deployment helper script (`vercel-deploy.js`)
- Updated environment validation for Vercel compatibility

## Migration Steps

1. **Setup Vercel Account**
   - Create a Vercel account if you don't have one already
   - Install the Vercel CLI: `npm install -g vercel`
   - Login to Vercel: `vercel login`

2. **Link Project to Vercel**
   - Run: `vercel link`
   - Follow the prompts to link your project

3. **Configure Environment Variables**
   - Copy environment variables from Netlify to Vercel
   - Go to Vercel dashboard > Your project > Settings > Environment Variables
   - Add all required environment variables (see `ENV_SETUP_GUIDE.md`)

4. **Initial Deployment**
   - Run: `npm run vercel:deploy`
   - This will deploy your application to Vercel

5. **Update DNS**
   - In Vercel dashboard, go to your project > Settings > Domains
   - Add your domains and follow instructions to update DNS

6. **Verify Deployment**
   - Check that your application is running correctly on Vercel
   - Test all key functionality

7. **Decommission Netlify**
   - Once Vercel deployment is verified, you can remove the Netlify configuration
   - Keep `netlify.toml` as a reference until fully migrated

## Key Differences: Netlify vs Vercel

| Feature | Netlify | Vercel |
|---------|---------|--------|
| Configuration | netlify.toml | vercel.json |
| Build Command | npm run validate:env && npm run build | Same |
| Output Directory | dist | dist |
| Environment Variables | Set in Netlify UI | Set in Vercel UI |
| Functions | /functions | /api |
| Headers | [[headers]] section | headers in vercel.json |
| Redirects | [[redirects]] section | rewrites in vercel.json |

## Commands

- **Prepare for deployment**: `npm run vercel:prepare`
- **Deploy to production**: `npm run vercel:deploy`
- **Create preview deployment**: `npm run vercel:preview`

## Additional Resources

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Environment Setup Guide](./ENV_SETUP_GUIDE.md)
- [Vercel Documentation](https://vercel.com/docs)
