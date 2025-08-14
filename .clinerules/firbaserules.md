# Firebase & Frontend Integration Instructions

## 1. Firebase Backend Setup Checklist

### 🔐 Firestore Security & Permissions
- Firestore security rules are correctly configured for reads/writes.
- Authenticated users (or service roles) are permitted for necessary paths.
- Rules are tested in the Firebase Emulator before deployment.

### 📦 Firestore Collections & Structure
- Collections (`trips`, `diesel`, `driverBehavior`, etc.) exist and are structured as expected.
- Each document includes unique IDs (`loadRef`, `fleetNumber`, etc.) for consistent syncing.
- Indexes are manually created where composite queries are needed (e.g. `status` + `eventDate`).

### ⚙️ Firebase Functions
- Cloud Functions (`importTrips`, `driverBehaviorWebhook`, etc.) are deployed and callable.
- Functions return proper success/failure responses with logging.
- Each function handles error validation, deduplication, and logging.
- Cron jobs or scheduled functions (if any) are active and logged.

### 📡 Realtime Features
- Firestore `onSnapshot` listeners are used where real-time sync is required.
- Backend-triggered updates (e.g. trip completion → `trip.status = completed`) reflect instantly.
- Realtime Database is used only if explicitly required (separate from Firestore).

### 📨 Authentication (if used)
- Firebase Auth is configured (Google, Email/Password, etc.).
- Users are correctly signed in before accessing protected data.

---

## 2. Frontend Sync & Visibility Checklist

### 🔁 Data Sync (Reading from Backend)
- `onSnapshot()` is used in components like `TripList.tsx`, `DieselDashboard.tsx` to pull live updates.
- State is updated in React using `useEffect()` and `setState()` based on real-time changes.
- Empty or null states are handled (`No data found`, `Loading...`, etc.).
- Pagination or limit queries are correctly handled (especially for performance).
- Component renders are conditional on `data.length > 0`.

### 📤 Submitting Data (Writing to Backend)
- `onSubmit` handlers call Firestore/Functions using `addDoc`, `setDoc`, `updateDoc`, or REST POSTs.
- Form validations prevent null/incomplete payloads.
- Submit buttons are disabled while loading, and re-enabled on success/failure.
- User receives feedback on submission (`Success!`, `Error saving trip`, etc.).

### 📡 UI Reflects Real-Time Backend State
- Status fields (e.g. `trip.status`) update visually when changed.
- Newly added entries (trips, diesel logs, behaviors) appear in real time in UI tables or dashboards.
- Deleted items are removed from UI instantly.
- Critical flags like `trip.flagged = true` show badges, red indicators, etc.

---

## 3. Code & Component Health Checklist

### 📁 Folder & Component Structure (`/src`)
- All forms (e.g. `TripForm.tsx`, `DieselForm.tsx`) are modular and reusable.
- Components are properly named and their props are well-typed.
- API call logic is abstracted to service files (`firebaseService.ts`, `tripsService.ts`).
- `useEffect` has correct dependencies to avoid infinite loops.

### 📌 Field-Level Checks
For every form or data field:
- Default values are defined.
- Placeholder, label, and tooltips are present.
- Each input is controlled and tied to state.
- Errors (missing fields, wrong format) are caught early.
- Hidden fields or system-calculated fields (e.g. cost per km) are handled via logic or post-processing.

### 📋 Logging & Debugging
- `console.log` or `toast.error()` used in development are removed or wrapped in `DEBUG_MODE`.
- Firestore errors are caught in `.catch()` with useful messages.
- Firebase Functions log to Cloud Logs or `Logger.log()` for traceability.

---

## 4. Final End-to-End Sync Test

### 🧪 Scenario-Based Testing
- Add a new trip → appears instantly in Active Trips dashboard
- Edit a trip → changes reflect in Completed Trips tab
- Delete a diesel entry → disappears immediately from Diesel Dashboard
- Post a driver event from Web Book → appears under `driverBehaviorEvents` with visual flag
- Upload inspection → generates linked job card and reflects in Workshop module
