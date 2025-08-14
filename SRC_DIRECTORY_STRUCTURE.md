# Matanuska Transport Platform Source Directory Structure

```
src/
├── api/                         # API integrations and services
│   ├── firebase.ts              # Firebase service integration
│   ├── firebaseAdmin.ts         # Firebase admin functionality
│   ├── index.ts                 # API exports
│   ├── sageIntegration.ts       # Sage accounting integration
│   └── wialon.ts                # Wialon GPS tracking integration
│
├── assets/                      # Static assets
│   ├── matanuska-logo-base64.ts # Base64 encoded logo for offline use
│   └── matanuska-logo.png       # Company logo image
│
├── components/                  # UI components organized by module
│   ├── Adminmangement/          # Admin management components
│   ├── clients/                 # Client management components
│   ├── common/                  # Shared/common components
│   ├── Cost Management/         # Cost tracking components
│   ├── DieselManagement/        # Fuel management components
│   ├── DriverManagement/        # Driver management components
│   ├── forms/                   # Form components
│   ├── Inventory Management/    # Inventory components
│   ├── InvoiceManagement/       # Invoice components
│   ├── layout/                  # Layout components (sidebar, etc.)
│   ├── lists/                   # List view components
│   ├── Map/                     # Map and location components
│   │   ├── pages/               # Map page components
│   │   └── wialon/              # Wialon integration components
│   │       └── models/          # Wialon data models
│   ├── maps/                    # Additional map components
│   ├── misc/                    # Miscellaneous components
│   ├── mobile/                  # Mobile-specific components
│   │   └── tyre/                # Mobile tyre management
│   ├── Models/                  # Modal components by module
│   │   ├── Diesel/              # Diesel management modals
│   │   ├── Driver/              # Driver management modals
│   │   ├── Flags/               # Flag and alert modals
│   │   ├── Invoice/             # Invoice management modals
│   │   ├── Trips/               # Trip management modals
│   │   ├── Tyre/                # Tyre management modals
│   │   └── Workshop/            # Workshop management modals
│   ├── testing/                 # Testing components
│   ├── TripManagement/          # Trip management components
│   ├── Tyremanagement/          # Tyre management components
│   ├── tyres/                   # Additional tyre components
│   ├── ui/                      # Core UI components
│   └── WorkshopManagement/      # Workshop management components
│
├── config/                      # Application configuration
│   ├── capacitor.config.ts      # Capacitor (mobile) configuration
│   ├── cloudRunEndpoints.ts     # Google Cloud Run endpoints
│   ├── routeUtils.ts            # Routing utilities
│   ├── sageAuth.ts              # Sage authentication
│   ├── sidebarConfig.ts         # Sidebar navigation config
│   └── tripWorkflowConfig.ts    # Trip workflow configuration
│
├── context/                     # React Context providers
│   ├── AppContext.tsx           # Main application context
│   ├── DriverBehaviorContext.tsx # Driver behavior context
│   ├── InventoryContext.tsx     # Inventory management context
│   ├── SyncContext.tsx          # Data synchronization context
│   ├── TripContext.tsx          # Trip management context
│   ├── TyreContext.tsx          # Tyre management context
│   ├── TyreReferenceDataContext.tsx # Tyre reference data
│   ├── TyreStoresContext.tsx    # Tyre inventory context
│   ├── WialonProvider.tsx       # Wialon integration context
│   └── WorkshopContext.tsx      # Workshop management context
│
├── data/                        # Static data and templates
│   ├── faultData.ts             # Fault codes and descriptions
│   ├── fleetVehicles.ts         # Fleet vehicle data
│   ├── index.ts                 # Data exports
│   ├── inspectionTemplates.ts   # Vehicle inspection templates
│   ├── jobCardTemplates.ts      # Workshop job card templates
│   ├── tyreData.ts              # Tyre specifications
│   ├── tyreMappingData.ts       # Tyre position mapping
│   ├── tyreReferenceData.ts     # Tyre reference data
│   ├── userDirectory.ts         # User directory
│   └── vehicles.ts              # Vehicle data
│
├── hooks/                       # Custom React hooks
│   ├── use-mobile.tsx           # Mobile detection hook
│   ├── useActionLogger.ts       # Action logging hook
│   ├── useCapacitor.ts          # Capacitor integration hook
│   ├── useClients.ts            # Client data hook
│   ├── useCurrencyConverter.ts  # Currency conversion
│   ├── useErrorHandling.ts      # Error handling hook
│   ├── useFirestoreDoc.ts       # Firestore document hook
│   ├── useFleetData.ts          # Fleet data hook
│   ├── useFleetList.ts          # Fleet listing hook
│   ├── useNetworkStatus.ts      # Network status detection
│   ├── useOfflineForm.ts        # Offline form handling
│   ├── useOfflineQuery.ts       # Offline data query
│   ├── useRealtimeTrips.ts      # Realtime trip tracking
│   ├── useToast.ts              # Toast notification hook
│   ├── useVendors.ts            # Vendor data hook
│   ├── useWebBookDriverBehavior.ts # Driver behavior hook
│   ├── useWebBookTrips.ts       # Trip booking hook
│   ├── useWialon.ts             # Wialon integration hook
│   ├── useWialonConnection.ts   # Wialon connection status
│   ├── useWialonDrivers.ts      # Wialon driver data
│   ├── useWialonGeofences.ts    # Wialon geofences
│   ├── useWialonResources.ts    # Wialon resources
│   ├── useWialonSdk.ts          # Wialon SDK integration
│   ├── useWialonSession.ts      # Wialon session management
│   ├── useWialonUnits.ts        # Wialon units data
│   └── WialonUnitList.tsx       # Wialon unit list component
│
├── lib/                         # Utility libraries
│   └── currency.ts              # Currency handling utilities
│
├── pages/                       # Page components
│   ├── clients/                 # Client-related pages
│   ├── diesel/                  # Diesel management pages
│   ├── drivers/                 # Driver management pages
│   ├── examples/                # Example pages
│   ├── invoices/                # Invoice management pages
│   ├── mobile/                  # Mobile-specific pages
│   ├── trips/                   # Trip management pages
│   ├── tyres/                   # Tyre management pages
│   └── workshop/                # Workshop management pages
│
├── types/                       # TypeScript type definitions
│   ├── audit.d.ts               # Audit log types
│   ├── client.ts                # Client data types
│   ├── diesel.d.ts              # Diesel/fuel data types
│   ├── global.d.ts              # Global type declarations
│   ├── googleMaps.d.ts          # Google Maps types
│   ├── index.ts                 # Type exports
│   ├── inventory.ts             # Inventory types
│   ├── invoice.ts               # Invoice types
│   ├── loadPlanning.ts          # Load planning types
│   ├── mapTypes.ts              # Map-related types
│   ├── react-calendar-timeline.d.ts # Calendar timeline types
│   ├── tyre-inspection.ts       # Tyre inspection types
│   ├── tyre.ts                  # Tyre data types
│   ├── User.ts                  # User types
│   ├── vehicle.ts               # Vehicle types
│   ├── vendor.ts                # Vendor types
│   ├── wialon.ts                # Wialon integration types
│   ├── workshop-job-card.ts     # Workshop job card types
│   └── workshop-tyre-inventory.ts # Workshop tyre inventory
│
└── utils/                       # Utility functions
    ├── auditLogUtils.ts         # Audit logging utilities
    ├── cn.ts                    # Class name utility
    ├── csvUtils.ts              # CSV handling utilities
    ├── envChecker.ts            # Environment checking
    ├── envUtils.ts              # Environment utilities
    ├── errorHandling.ts         # Error handling utilities
    ├── firebaseConnectionHandler.ts # Firebase connection
    ├── firestoreConnection.ts   # Firestore connection
    ├── firestoreUtils.ts        # Firestore utilities
    ├── formatters.ts            # Data formatting utilities
    ├── googleMapsLoader.ts      # Google Maps loader
    ├── helpers.ts               # Helper functions
    ├── inspectionUtils.ts       # Inspection utilities
    ├── mapConfig.ts             # Map configuration
    ├── mapsService.ts           # Maps service
    ├── networkDetection.ts      # Network detection
    ├── offlineCache.ts          # Offline caching
    ├── offlineOperations.ts     # Offline operations
    ├── pdfGenerators.ts         # PDF generation utilities
    ├── placesService.ts         # Places service
    ├── qrCodeUtils.ts           # QR code utilities
    ├── sageDataMapping.ts       # Sage data mapping
    ├── setupEnv.md              # Environment setup docs
    ├── setupEnv.ts              # Environment setup
    ├── sidebar-validator.ts     # Sidebar validation
    ├── syncService.ts           # Data synchronization
    ├── tripDebugger.ts          # Trip debugging
    ├── tyreAnalytics.ts         # Tyre analytics
    ├── tyreConstants.ts         # Tyre constants
    ├── useTyreStores.ts         # Tyre stores hook
    ├── webhookSenders.ts        # Webhook utilities
    ├── wialonAuth.ts            # Wialon authentication
    ├── wialonConfig.ts          # Wialon configuration
    ├── wialonLoader.ts          # Wialon loader
    └── wialonSensorData.ts      # Wialon sensor data
```

## Main Application Files

- **App.tsx**: Main application component that sets up the router, contexts, and error boundaries
- **AppRoutes.tsx**: Dynamic route generation from the sidebar configuration
- **firebase.ts**: Firebase initialization and configuration
- **firebaseConfig.ts**: Firebase project configuration
- **index.css**: Global CSS styles
- **main.tsx**: Application entry point
- **SidebarTester.tsx**: Tool for testing sidebar navigation
- **testRouting.tsx**: Tool for testing routing
- **vite-env.d.ts**: Vite environment type declarations