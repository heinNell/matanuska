# APppp - Advanced Fleet Management Platform

APppp is a comprehensive fleet management platform built with React, TypeScript, and Firebase.

## Key Features

- Fleet management and tracking
- Trip monitoring and optimization
- Invoice management
- Google Maps integration
- Wialon integration (optional)

## Quick Start

1. Clone the repository
2. Set up environment variables (see [Environment Setup Guide](ENV_SETUP_GUIDE.md))
3. Install dependencies
   ```bash
   npm install
   ```
4. Start the development server
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Serve production build locally
- `npm run verify:ui-connections` - Run the UI connection verification tool
- `npm run check:integration` - Check component integration with routes and navigation
- `npm run scan:ui-connections` - Scan for UI elements without handlers

## Environment Setup

This project requires several environment variables to function properly. See the [Environment Setup Guide](ENV_SETUP_GUIDE.md) for details.

## Firebase Setup

The application uses Firebase for backend functionality. See the [Firebase Integration](FIREBASE_INTEGRATION.md) document for setup instructions.

## Project Structure

See the [App Structure](APP_STRUCTURE.md) document for a detailed breakdown of the project structure.

## Routing System

The application uses a unified routing system tied to the sidebar navigation. See the [Unified Routing](UNIFIED_ROUTING.md) document for details.

## Google Maps Integration

See the [Google Maps Integration](docs/GOOGLE_MAPS.md) document for details on the maps functionality.

## Development Tools

### UI Connection Verification

The project includes a tool to verify that UI elements are properly connected to handlers.
This helps identify potential issues with buttons, forms, and modals.

See the [UI Verification Tool Guide](UI_VERIFICATION_TOOL.md) for detailed usage instructions.

### Component Integration Check

This tool verifies proper integration between routes, navigation, and components.
It helps identify missing components, duplicate implementations, and inconsistent routes.

See the [Integration Check Tool Guide](INTEGRATION_CHECK_TOOL.md) for detailed usage instructions.

### UI Connection Scanner

This tool scans components for UI elements (buttons, forms, inputs, links) and checks if they
have corresponding handler functions, helping identify potentially unresponsive UI elements.

See the [UI Connection Scanner Tool Guide](UI_CONNECTION_SCANNER_TOOL.md) for detailed usage instructions.

## Resilience & Offline Capabilities

The Matanuska Fleet Manager is built with offline-first capabilities and resilient design to ensure continuous operation in challenging connectivity environments. Key features include:

- **Offline Data Management**: Continue working with local data when offline
- **Operation Queuing**: Actions performed offline are queued for later synchronization
- **Real-time Connection Status**: Clear indicators show current network status
- **Enhanced Error Handling**: Comprehensive error recovery mechanisms
- **Graceful Degradation**: App remains functional with reduced capabilities during connectivity issues

For detailed information about these capabilities, see the [Resilience Improvements](RESILIENCE_IMPROVEMENTS.md) document.

## Mobile QR Integration Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Add Capacitor to your project:
   ```
   npx cap init
   npx cap add android
   npx cap add ios
   ```

3. Build your app:
   ```
   npm run build
   npx cap sync
   npx cap open android
   ```

4. In the mobile app, use the "Scan QR" button to scan codes and open in-app routes.

5. Ensure QR codes generated point to valid in-app URLs.

## License

Proprietary - All rights reserved.
