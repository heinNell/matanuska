---
title: Matanuska Transport Platform - AI Coding Agent Instructions
applyTo: "**"
version: 2.0
effective: 2025-09-01
owner: Engineering PMO
status: enforced
---

# Matanuska Transport Platform - AI Coding Agent Instructions

## 0) Purpose & Non-Removal Policy (Critical)

**Primary Directive:** Protect production integrity and analytical trust. **NO FILES OR CODE ARE DELETED CASUALLY.** All changes must preserve end-to-end behavior unless explicitly approved through the Change Request workflow.

### 0.1 Non-Deletion Rules

- **HARD RULE:** No deletions of files, exports, models, components, schemas, migrations, or routes without prior written approval
- **Allowed without approval:** Purely additive changes, comments, docs, test additions (non-mocking)
- **Soft-delete protocol:** Quarantine instead of deleting - move to `/_archive/<yyyy-mm>/` with README explaining rationale
- **Refactors:** Must be behavior-preserving with identical public APIs

### 0.2 Real Data Only (No Mocks)

- **Prohibited:** `msw`, `nock`, `faker`, `chance`, synthetic fixtures, stubbed endpoints, demo data
- **Required:** Sanitized production snapshots or read-only staging replicas with real data
- **Tests:** Must call real services or sanctioned snapshots with documented provenance

## 1) Project Overview

Matanuska is a comprehensive fleet management application managing trips, vehicles, tyres, invoices, diesel consumption, drivers, compliance, and workshop operations.

### 1.1 Technology Stack

- **Frontend:** React 18+, TypeScript, Tailwind CSS
- **Backend:** Firebase (Firestore, Authentication, Storage, Functions)
- **State Management:** React Context API
- **Build Tool:** Vite
- **Mobile:** Capacitor for native features
- **Data Visualization:** react-calendar-timeline, recharts, chart.js

## 2) Architecture Patterns

### 2.1 Component Organization

```
src/
├── components/{domain}/          # Domain-specific components
├── components/ui/                # Reusable UI components
├── pages/{domain}/               # Route components
├── context/                      # React Contexts
├── hooks/                        # Custom hooks
└── utils/                        # Utilities
```

### 2.2 Data Flow Patterns

```typescript
// Real-time subscription pattern
useEffect(() => {
  const q = query(
    collection(db, "trips"),
    where("status", "==", "active"),
    orderBy("startTime", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const tripData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime?.toDate(),
      endTime: doc.data().endTime?.toDate(),
    }));
    setTrips(tripData);
  });
}, []);
```

### 2.3 Offline-First Architecture

```typescript
const TripForm: React.FC<TripFormProps> = ({ onSubmit }) => {
  const { isOnline } = useNetworkStatus();
  const { queueOperation } = useSyncQueue();

  const handleSubmit = async (data: TripData) => {
    if (isOnline) {
      await onSubmit(data);
    } else {
      queueOperation({
        type: "CREATE_TRIP",
        data,
        timestamp: new Date().toISOString(),
      });
    }
  };
};
```

## 3) Development Workflow

### 3.1 Local Development

```bash
npm install                  # Install dependencies
cp .env.example .env       # Configure environment
npm run dev                # Start dev server
npm run emulators          # Start Firebase emulators
```

### 3.2 Testing Commands

- `npm test` - Unit tests
- `npm run test:integration` - Integration tests
- `npm run verify:ui-connections` - UI verification
- `npm run verify:integration` - Cross-component testing

### 3.3 Mobile Testing

```bash
npm run build
npx cap sync
npx cap open android  # or ios
```

## 4) Code Quality Standards

### 4.1 Naming Conventions

- **Components:** PascalCase (e.g., `TripCard.tsx`)
- **Hooks:** camelCase with 'use' prefix (e.g., `useRealtimeTrips.ts`)
- **Contexts:** PascalCase with 'Context' suffix (e.g., `TripContext.ts`)

### 4.2 Import Patterns

```typescript
// Recommended: Barrel imports
import { Button, Card, Badge } from "@/components/ui";

// Direct import only when necessary
import Button from "@/components/ui/Button";
```

### 4.3 Component Structure

```typescript
interface ComponentProps {
  // Props interface at top
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // State/hooks at top
  const [state, setState] = useState();

  // Event handlers next
  const handleEvent = () => {};

  // JSX last
  return <div className="...">{/* Components use Tailwind */}</div>;
};
```

## 5) Integration Points

### 5.1 Firebase Collections

```typescript
const collections = {
  trips: "trips", // Trip records
  vehicles: "vehicles", // Fleet vehicles
  drivers: "drivers", // Driver profiles
  jobCards: "jobCards", // Workshop records
  tyres: "tyres", // Tyre inventory
  fuelEntries: "diesel", // Fuel consumption
};
```

### 5.2 GPS Integration Pattern

```typescript
// Wialon GPS integration
export const useWialonConnection = () => {
  const initializeWialon = async () => {
    await window.wialon.core.Session.getInstance().initSession("https://hst-api.wialon.com");
    await window.wialon.core.Session.getInstance().login(wialonToken);
  };

  const getVehicleLocation = async (unitId: string) => {
    const unit = await window.wialon.core.Session.getInstance().getItem(unitId);
    return {
      lat: unit.getPosition().y,
      lng: unit.getPosition().x,
      speed: unit.getPosition().s,
      timestamp: unit.getPosition().t,
    };
  };
};
```

## 6) Common Pitfalls & Guardrails

### 6.1 Critical Rules

- **ALWAYS** use `onSnapshot` for real-time data with proper cleanup
- **NEVER** use mock/synthetic data (see §0.2)
- **ALWAYS** handle offline states with sync queue
- **NEVER** delete files without approval (see §0.1)
- **ALWAYS** test at all responsive breakpoints

### 6.2 TypeScript Requirements

- Use strict TypeScript (no `any` types)
- Explicit types for all exports
- Runtime validation at IO boundaries
- Branded types for IDs

### 6.3 Performance Guidelines

- Batched Firestore writes
- Debounced form-driven writes
- Memoized derived lists
- Route-level code splitting

## 7) Change Management

### 7.1 Approval Workflow

For any deletion or breaking change:

1. Create Change Request (CR) ticket
2. Document impact analysis
3. Provide rollback plan
4. Get approval from Tech Lead + Product Owner
5. Archive instead of delete when possible

### 7.2 Archive Protocol

```
/_archive/2025-09/
├── README.md (rationale + rollback steps)
├── deprecated-component/
└── rollback-instructions.md
```

---

## 8) Final Enforcement

This policy supersedes any automated suggestions. Tools may **suggest** changes, but **cannot delete** files or use mock data without explicit approval.

**Remember:** When in doubt, quarantine rather than delete, and always preserve data integrity.
