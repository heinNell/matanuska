# Recommended Folder Structure for Fleet Management Application

## Introduction

This document outlines a recommended folder structure for the fleet management application, addressing the current issues with duplicated files, inconsistent naming, and performance concerns.

## Proposed Folder Structure

```
src/
├── api/                         # API client implementations
│   ├── fleet/                   # Fleet management API
│   ├── tracking/                # Tracking and location API
│   └── wialon/                  # Wialon API integration
│
├── assets/                      # Static assets
│
├── components/                  # Reusable components
│   ├── common/                  # Shared components
│   ├── forms/                   # Form components
│   │   ├── client/
│   │   ├── cost/
│   │   ├── diesel/
│   │   ├── driver/
│   │   └── ...
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Layout.tsx
│   │   └── ...
│   ├── maps/                    # Map components
│   │   ├── common/              # Shared map components
│   │   │   ├── GoogleMapBase.tsx
│   │   │   └── MapControls.tsx
│   │   ├── fleet/               # Fleet map components
│   │   │   ├── FleetMapComponent.tsx
│   │   │   └── VehicleMarker.tsx
│   │   └── wialon/              # Wialon map components
│   │       ├── WialonMapComponent.tsx
│   │       └── WialonControls.tsx
│   └── ui/                      # UI components
│
├── context/                     # Context providers
│
├── features/                    # Feature modules
│   ├── dashboard/               # Dashboard feature
│   │   ├── components/          # Dashboard-specific components
│   │   ├── hooks/               # Dashboard-specific hooks
│   │   └── pages/               # Dashboard pages
│   ├── fleet/                   # Fleet management feature
│   ├── drivers/                 # Driver management feature
│   ├── trips/                   # Trip management feature
│   ├── maps/                    # Maps feature
│   │   ├── components/          # Map-specific components
│   │   ├── hooks/               # Map-specific hooks
│   │   ├── utils/               # Map-specific utilities
│   │   └── pages/               # Map pages
│   └── ...                      # Other features
│
├── hooks/                       # Custom hooks
│   ├── useDataFetching.ts       # Data fetching hook
│   ├── useMapInteraction.ts     # Map interaction hooks
│   └── ...
│
├── pages/                       # Page components
│   ├── dashboard/               # Dashboard pages
│   ├── maps/                    # Map pages
│   ├── fleet/                   # Fleet pages
│   └── ...                      # Other page types
│
├── services/                    # Service implementations
│   ├── authentication.ts        # Authentication service
│   ├── geolocation.ts           # Geolocation service
│   └── ...                      # Other services
│
├── store/                       # State management
│   ├── slices/                  # Redux slices or context slices
│   └── ...
│
├── types/                       # TypeScript type definitions
│   ├── api.ts                   # API response types
│   ├── fleet.ts                 # Fleet data types
│   ├── maps.ts                  # Map-related types
│   └── ...                      # Other type definitions
│
└── utils/                       # Utility functions
    ├── formatting.ts            # Formatting utilities
    ├── mapUtils.ts              # Map utilities
    ├── caching.ts               # Caching utilities
    └── ...                      # Other utilities
```

## Key Improvements in the Structure

1. **Feature-Based Organization**
   - Modules are organized around features, promoting better separation of concerns
   - Each feature has its own components, hooks, and utilities

2. **Consistent Naming Conventions**
   - Use lowercase for folder names
   - Use PascalCase for component files
   - Use camelCase for utility and hook files

3. **Clear Separation of Concerns**
   - Components are grouped by functionality
   - UI components are separated from business logic
   - API interactions are centralized in the api folder

4. **Elimination of Duplicate Files**
   - Consolidate map components into a single location
   - Clear delineation between component types (e.g., fleet vs wialon)

5. **Better Type Organization**
   - Centralized type definitions for better reuse and consistency
   - Domain-specific types grouped together

## Implementation Guidelines

### 1. Maps Components Reorganization

Current Duplicate Components to Consolidate:

- `/components/Map/WialonMapComponent.tsx` and `/pages/wialon/WialonMapComponent.tsx` should be merged
- Maps-related functionality should be in the `/features/maps/` directory

### 2. Data Fetching Optimization

- Implement data fetching hooks to centralize API calls
- Add caching layer for frequently accessed data
- Use React Query or a similar library for data fetching, caching, and synchronization

### 3. Rendering Performance

- Implement virtualization for large lists using react-window or react-virtualized
- Add pagination for data tables
- Use memo and useMemo for expensive computations

### 4. Type Safety Improvements

- Fix the current TypeScript errors in WialonMapComponent
- Create proper type definitions for the Wialon SDK
- Ensure consistent typing across the application

## Migration Strategy

1. Create the new folder structure alongside the existing one
2. Gradually move components to their new locations, updating imports as needed
3. Use barrel files (index.ts) to simplify import paths
4. Update the application routes to reflect the new structure
5. Remove duplicate files once migration is complete

By following this structure, the application will be more maintainable, have better performance, and avoid the current duplication issues.
