# Netlify Setup Guide for Matanuska Transport Platform

This guide provides step-by-step instructions for connecting your Matanuska Transport Platform to the specified Netlify project.

## Project Information

- **Project Name:** matanuskatransportt
- **Project ID/Site ID:** 58378633-127a-44c4-878e-61f92936861d
- **Site URL:** <https://matanuskatransportt.netlify.app/>

## Deployment Badge

You can add this badge to your README.md file to show the current deployment status:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/58378633-127a-44c4-878e-61f92936861d/deploy-status)](https://app.netlify.com/projects/matanuskatransportt/deploys)
```

## Setup Instructions

### 1. Connect to Netlify

If you haven't already connected your repository to Netlify:

1. Log in to [Netlify](https://app.netlify.com/)
2. Navigate to the specified project: matanuskatransportt
3. Go to **Site settings** > **Build & deploy** > **Continuous Deployment**
4. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
5. Select the repository containing your Matanuska Transport Platform code

### 2. Configure Build Settings

In the Netlify dashboard:

1. Go to **Site settings** > **Build & deploy** > **Build settings**
2. Verify the following settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node.js version:** 22.15.1 (in Environment variables)

### 3. Set Up Environment Variables

1. Go to **Site settings** > **Build & deploy** > **Environment variables**
2. Add all required environment variables from your `.env.production` file, including:
   - Firebase configuration
   - Wialon integration credentials
   - Google Maps API keys
   - Cloud Run URLs
   - Service account credentials

> **Security Note:** Keep sensitive information in the Netlify environment variables rather than in the netlify.toml file.

### 4. Create a Build Hook

1. Go to **Site settings** > **Build & deploy** > **Continuous Deployment** > **Build hooks**
2. Click **Add build hook**
3. Enter a name for the hook (e.g., "Manual Deployment Trigger")
4. Select the branch to build (typically "main" or "master")
5. Copy the generated URL
6. Update the `BUILD_HOOK_URL` in the `deploy.sh` script with this new URL

### 5. Deploy Your Site

You can deploy your site using one of the following methods:

#### Method 1: Using deploy.sh Script

1. Open a terminal in your project directory
2. Run the deploy script:

```bash
./deploy.sh
```

This will trigger a build via the build hook.

#### Method 2: Manual Deployment

For the full application:

1. Push changes to your connected Git repository
2. Netlify will automatically start a new build

For the simplified test version:

1. Run the simplified deployment scripts:

```bash
./create-deployment-preview.sh
./deploy-netlify.sh
```

## Troubleshooting

If you encounter deployment issues:

1. **Build failures:**
   - Check the build logs in the Netlify dashboard
   - Ensure all required environment variables are set
   - Confirm the Node.js version is set to 22.15.1

2. **Missing environment variables:**
   - Compare the variables in your `.env.production` file with those set in Netlify
   - Remember to add any new variables that might be required

3. **Authentication issues:**
   - Verify that all API keys and tokens are correctly set
   - Ensure service account credentials are properly formatted

## Next Steps

After successful deployment:

1. Verify the application is working correctly at <https://matanuskatransportt.netlify.app/>
2. Set up branch deploys or deploy contexts if needed
3. Configure custom domains if required
4. Set up form handling if your application uses Netlify Forms

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)