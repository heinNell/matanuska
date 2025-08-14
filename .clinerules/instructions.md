# matrefactor - Fleet Management Platform: Copilot Instructions

This document provides essential context for AI agents working with the APppp Fleet Management codebase. Use this guide to understand the architecture, patterns, and workflows.

## Project Overview

## Matrefactor is a comprehensive fleet management platform built with:

- **Frontend**: React 18+, TypeScript, Tailwind CSS, Vite
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **Mobile**: Capacitor for mobile deployment (Android/iOS)
- **State Management**: React Context API with Firebase real-time data
- **Key Features**: Trip management, invoice processing, tyre tracking, fleet analytics, offline capabilities
- **Key Integrations**: Google Maps, Wialon telematics (optional)

## Architecture & Core Patterns

### Directory Structure

src/
├── pages/ # Main routed pages (by domain)
├── components/ # UI blocks, forms, modals, cards
├── forms/ # Embedded forms ONLY – not pages
├── context/ # React state contexts
├── hooks/ # useX hooks for data, side effects
├── api/ # Firebase, Wialon, Sage APIs
├── utils/ # Shared utilities, validators, etc.
├── config/ # Sidebar, routes, workflow configs
├── firebase.ts # Core Firebase entry
functions/ # Cloud Functions (outside /src)

### Routing & Navigation

- **Routing System**: Uses React Router v6 with nested routes
- **Key Pattern**: Routes are defined in `AppRoutes.tsx` and mapped to sidebar items in `config/sidebarConfig.ts`
- **Single Source of Truth**: The sidebar configuration (`sidebarConfig.ts`) defines both navigation and routes
- **Lazy Loading**: All page components are lazy-loaded using React.Suspense
- **Route Structure Example**:
  ```tsx
  // From AppRoutes.tsx
  <Route path="trips" element={<TripManagementPage />}>
    <Route index element={<ActiveTripsPage />} />
    <Route path="active" element={<ActiveTripsPageEnhanced />} />
    <Route path="completed" element={<CompletedTrips />} />
  </Route>
  ```

### Form Implementation Pattern

The application uses custom hooks for form handling with offline support:

```jsx
import { useOfflineForm } from "../hooks/useOfflineForm";

// Pattern for forms with offline-capable Firebase integration
const { submit, remove, isSubmitting, isOfflineOperation } = useOfflineForm({
  collectionPath: "trips", // Firestore collection
  showOfflineWarning: true, // Show warning when operating offline
  onSuccess: (data) => {
    // Handle success
  },
});

// Use in submit handler
const handleSubmit = async (formData) => {
  await submit(formData, id); // id is optional (for updates)
};
```

### Firebase Integration & Offline-First Pattern

- Real-time data uses Firestore listeners with `onSnapshot` and offline caching
- Key Firestore collections: `trips`, `vehicles`, `tyres`, `invoices`, `fuelEntries`, `drivers`
- Offline capabilities implemented with custom hooks:
  - `useOfflineQuery` for fetching data that works offline
  - `useOfflineForm` for submitting form data with offline queuing
- Environment-specific Firebase configuration in `firebaseConfig.ts`
- Network state detection with `subscribeToNetworkChanges` from `networkDetection.ts`

## Development Workflow

### Key Scripts

- `npm run dev` - Starts Vite dev server and Node backend concurrently
- `npm run build` - Builds for production
- `npm test:all` - Runs all tests
- `npm run verify:forms` - Verifies form connections
- `npm run verify:buttons` - Checks button connections

### Testing & Verification

- Form integrations can be tested with `npm run verify:forms`
- UI components can be verified with `npm run verify:ui`
- Routing can be tested with `npm run test:routing`

## Common Pitfalls & Best Practices

1. **Component Placement**: Page components belong in `/pages`, reusable components in `/components`
2. **Firebase Patterns**:
   - Always use `onSnapshot` for real-time data, unsubscribe in cleanup functions
   - Always wrap Firebase operations in try/catch blocks
   - Use offline-capable hooks (`useOfflineQuery`, `useOfflineForm`) instead of direct Firestore calls
3. **Form Integration**:
   - Follow offline-first patterns with `useOfflineForm` hook
   - Check `FORM_IMPLEMENTATION_GUIDE.md` for more details
4. **TypeScript**:
   - Use strongly-typed interfaces from `/types` directory
   - Follow type definitions for Firebase document structures
5. **Route Configuration**:
   - When adding routes, update both `AppRoutes.tsx` and `sidebarConfig.ts`
   - Ensure new components are lazy-loaded with Suspense

## Refactoring Guidelines

This codebase is undergoing refactoring with these priorities:

1. Improve code readability and maintainability
2. Remove dead code and unused imports
3. Standardize file organization according to `FILE_ORGANIZATION_RECOMMENDATION.md`
4. Preserve core functionality during all refactoring efforts
5. Follow TypeScript best practices with proper typing
