## Brief overview
Comprehensive project-specific guidelines for the Matanuska Fleet Management Platform - a sophisticated React/TypeScript application with Firebase backend, Wialon GPS integration, Google Maps API, offline-first capabilities, and cross-platform mobile support via Capacitor. The platform manages all aspects of fleet operations including trips, invoices, fuel, drivers, workshops, tyres, and compliance.

## Technology stack standards
- **Frontend**: React 18+ with TypeScript for type safety and modern development patterns
- **Build System**: Vite for fast development and optimized production builds
- **Backend**: Firebase suite (Authentication, Firestore, Realtime Database, Storage, Functions)
- **Real-time Data**: Firestore `onSnapshot` listeners for live updates across all modules
- **GPS Integration**: Wialon API for vehicle tracking and telematics data
- **Maps**: Google Maps API for route visualization and location services
- **Styling**: Tailwind CSS with utility-first approach and responsive design
- **Mobile**: Capacitor for cross-platform deployment with native capabilities
- **Testing**: Vitest framework with comprehensive test coverage
- **Data Visualization**: react-calendar-timeline for Gantt charts, recharts for analytics

## Application architecture patterns
- **Domain-Based Component Structure**: Organize components by business domain (TripManagement, InvoiceManagement, DieselManagement, etc.) with specialized subdirectories (forms/, pages/, reports/)
- **Context-Driven State Management**: Use React Context API for global state with domain-specific contexts (TripContext, TyreStoresContext, DriverBehaviorContext, etc.)
- **Offline-First Design**: Implement IndexedDB caching, operation queuing, and network resilience patterns
- **Route Configuration**: Single source of truth in `sidebarConfig.ts` that drives both navigation and routing
- **Real-time Architecture**: Leverage Firestore listeners for live data updates across all fleet operations

## Component organization standards
- **Domain Structure**: Follow the migration guide pattern:
  ```
  components/
  ├── TripManagement/
  │   ├── forms/
  │   ├── pages/
  │   └── reports/
  ├── InvoiceManagement/
  ├── DieselManagement/
  ├── DriverManagement/
  ├── WorkshopManagement/
  ├── TyreManagement/
  ├── InventoryManagement/
  ├── ComplianceSafetyManagement/
  └── CustomerManagement/
  ```
- **Component Classification**: Place forms in `forms/`, complex UI components in `pages/`, and data visualizations in `reports/`
- **Duplicate Prevention**: Consolidate similar components using re-export patterns while preserving all functionality
- **UI Components**: Maintain consistent base components in `components/ui/` with forwardRef, variant systems, and comprehensive TypeScript interfaces

## Fleet management domain rules
- **Trip Management**: Handle active trips, completed trips, timeline visualization, route optimization, and load planning
- **Real-time Tracking**: Integrate with Wialon API for live vehicle positions and status updates
- **Invoice Workflow**: Support complete lifecycle from creation through approval to payment tracking
- **Fuel Management**: Track consumption, detect anomalies, analyze efficiency, and manage fuel cards
- **Driver Operations**: Monitor behavior, track performance, manage schedules, and ensure compliance
- **Workshop Integration**: Manage job cards, inspections, fault tracking, and parts inventory
- **Tyre Management**: Track inventory, performance, inspections, and replacement schedules

## Firebase integration protocols
- **Authentication**: Use FirebaseAuthContext for user management and role-based access
- **Data Structure**: Organize Firestore collections by domain (trips, vehicles, tyres, invoices, fuelEntries, drivers, jobCards, inspections)
- **Real-time Subscriptions**: Implement `onSnapshot` listeners for critical data with proper cleanup
- **Offline Support**: Use Firebase offline persistence with custom caching strategies
- **Security Rules**: Implement comprehensive security rules in `firestore.rules`
- **Admin Operations**: Use Firebase Admin SDK for server-side operations with elevated privileges
- **Cloud Functions**: Handle webhooks, data processing, and scheduled operations

## Wialon GPS integration requirements
- **Authentication**: Use token-based authentication with session management
- **API Pattern**: Follow the established curl request pattern using form-encoded POST requests
- **Data Format**: Handle Wialon unit structure (nm, cls, id, mu, uacl properties)
- **Real-time Updates**: Integrate location data with Firebase for unified data access
- **Context Provider**: Use WialonAuthContext for authentication state management
- **Error Handling**: Implement comprehensive error handling for network and API errors

## Offline-first development standards
- **Network Detection**: Implement advanced connectivity checks beyond `navigator.onLine`
- **Data Caching**: Use IndexedDB for persistent offline data storage with TTL management
- **Operation Queuing**: Queue operations during offline periods for later synchronization
- **UI Adaptation**: Provide contextual offline indicators and modified workflows
- **Custom Hooks**: Use `useOfflineQuery` and `useOfflineForm` for transparent online/offline data access
- **Error Boundaries**: Implement self-healing mechanisms for recoverable errors

## Code quality and maintenance
- **TypeScript Strict Mode**: Enforce strict type checking and comprehensive interfaces
- **Component Status Tracking**: Maintain component implementation status with ✅ Complete and ✅ Basic classifications
- **Duplicate Elimination**: Consolidate duplicate components while preserving all functionality through re-exports
- **Error Handling**: Implement comprehensive error boundaries and graceful degradation
- **Testing Strategy**: Test routing connections, UI interactions, and offline scenarios
- **Documentation**: Maintain detailed markdown guides for complex integrations and migrations

## Mobile and responsive design
- **Capacitor Integration**: Support QR scanning, file access, and device-specific features
- **Responsive Patterns**: Design for multiple screen sizes and orientations
- **Touch Interface**: Optimize for mobile touch interactions and gestures
- **Offline Mobile**: Ensure core functionality works without network connectivity
- **Performance**: Optimize for mobile device capabilities and battery life

## Development workflow best practices
- **Environment Management**: Maintain separate configurations for development, staging, and production
- **Build Process**: Use environment-specific builds with proper feature flags
- **Deployment**: Support multiple deployment targets (Netlify, Vercel, Firebase Hosting)
- **Testing**: Run comprehensive tests including routing, UI connections, and integration tests
- **Documentation**: Keep analysis files, migration guides, and integration documentation current
- **Version Control**: Use descriptive commit messages and maintain detailed changelogs

## Security and compliance considerations
- **Data Protection**: Implement proper access controls for sensitive fleet and financial data
- **Role-Based Access**: Use Firebase custom claims for role-based permissions
- **API Security**: Secure all external integrations (Wialon, Google Maps) with proper error handling
- **Offline Security**: Ensure offline data is properly secured and encrypted
- **Audit Trails**: Maintain logs for critical operations and data changes
