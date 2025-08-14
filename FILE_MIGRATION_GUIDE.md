# File Migration Guide

This guide provides step-by-step instructions for reorganizing your React application file structure. It focuses on practical migration steps to minimize disruption while improving code organization.

## Pre-Migration Checklist

Before starting the migration:

1. ✅ **Back up your code**: Ensure everything is committed to version control
2. ✅ **Run tests**: Make sure all tests pass before starting
3. ✅ **Document current routes**: Create a list of all active routes in your application
4. ✅ **Identify high-risk files**: Note files that are imported across many parts of the application

## Migration Strategy

We'll use a phased approach:

1. **Create Directory Structure**: Set up the new directories without moving files
2. **Batch Migration**: Move files in related batches (e.g., all trip-related files)
3. **Update Imports**: Fix import statements for each batch
4. **Test**: Verify functionality after each batch

## Step-by-Step Migration Plan

### Step 1: Create Standard Directory Structure

Create the standardized directories:

```bash
# Create main structure
mkdir -p src/pages/dashboard
mkdir -p src/pages/drivers
mkdir -p src/pages/trips
mkdir -p src/pages/fleet
mkdir -p src/pages/tyres
mkdir -p src/pages/invoices
mkdir -p src/pages/workshop
mkdir -p src/pages/customers
mkdir -p src/pages/compliance

mkdir -p src/components/drivers
mkdir -p src/components/trips
mkdir -p src/components/fleet
mkdir -p src/components/tyres
mkdir -p src/components/invoices
mkdir -p src/components/workshop
mkdir -p src/components/customers
mkdir -p src/components/compliance
```

### Step 2: Migrate Trip Management Files

Start with trip management as an example:

1. **Move Trip Pages**:
   - Identify trip-related page files:
     - `src/components/misc/ActiveTripsPage.tsx`
     - `src/components/misc/AddTripPage.tsx`
     - `src/components/misc/CompletedTripsPage.tsx`
     - `src/components/misc/TripManagementPage.tsx`
     - `src/pages/trips/TripDashboard.tsx`

   - Move them to `src/pages/trips/`

2. **Move Trip Components**:
   - Identify trip-related component files:
     - `src/components/Tripmanagement/ActiveTrips.tsx`
     - `src/components/Tripmanagement/CompletedTrips.tsx`
     - `src/components/Tripmanagement/TripDeletionModal.tsx`
     - `src/components/Tripmanagement/TripDetails.tsx`
     - `src/components/Tripmanagement/TripFormModal.tsx`
     - `src/components/Tripmanagement/TripPlanningForm.tsx`

   - Move them to `src/components/trips/`

3. **Update Import Statements**:
   For each file that imports the moved files, update the import paths. For example:

   ```diff
   - import TripDetails from '../../components/Tripmanagement/TripDetails';
   + import TripDetails from '../../components/trips/TripDetails';
   ```

### Step 3: Migrate Driver Management Files

Follow the same process:

1. **Move Driver Pages**:
   - Identify driver-related page files:
     - `src/components/DriverManagement/DriverBehaviorEventspage.tsx`
     - `src/components/misc/DriverManagementPage.tsx`
     - `src/pages/Drivermanagementpages/DriverManagementPage.tsx`

   - Move them to `src/pages/drivers/`

2. **Move Driver Components**:
   - Identify driver-related component files:
     - `src/components/DriverManagement/AddNewDriver.tsx`
     - `src/components/DriverManagement/DriverDetails.tsx`
     - `src/components/DriverManagement/DriverProfiles.tsx`
     - `src/components/DriverManagement/DriverRewards.tsx`
     - `src/components/DriverManagement/EditDriver.tsx`
     
   - Move them to `src/components/drivers/`

3. **Update Import Statements**

### Step 4: Migrate Tyre Management Files

Follow the same process for tyre management files.

### Continue with Each Domain Area

Repeat the process for each domain area:
- Fleet Management
- Invoice Management
- Workshop Management
- Customer Management
- Compliance
- etc.

## Handling Edge Cases

### 1. Duplicate Files

If you find duplicate files (e.g., similar files in both pages and components):

1. Compare them carefully to understand the differences
2. Choose the most up-to-date or complete version
3. Update all imports to point to the chosen file
4. Delete the duplicate

### 2. Files with Mixed Concerns

For files that have both page and component characteristics:

1. Extract the reusable component parts into a dedicated component file
2. Keep the routing and page-specific logic in the page file
3. Import the new component into the page file

### 3. Updating Route Configuration

After moving page files:

1. Locate your router configuration (likely in App.tsx or a routes.tsx file)
2. Update import paths for all moved page components
3. Test all routes to ensure they still work correctly

## Testing After Migration

After each batch of files is moved:

1. **Build the application**: Ensure there are no compilation errors
2. **Navigate all affected routes**: Verify pages load correctly
3. **Test functionality**: Ensure core features still work properly
4. **Check for console errors**: Look for runtime errors or warnings

## Automation Tools

Consider using these tools to help with the migration:

1. VSCode's search and replace with regex
2. Find commands to locate imports:

   ```bash
   # Find all files importing from the old location
   grep -r "from '.*Tripmanagement/" src/ --include="*.tsx" --include="*.ts"
   ```

3. Git to track changes and revert if needed

## Final Verification

Once all files have been moved:

1. ✅ Build the application
2. ✅ Run all tests
3. ✅ Navigate through the entire application
4. ✅ Check for any import errors in the console

## Conclusion

Follow this guide systematically to reorganize your files with minimal disruption. The end result will be a more maintainable and well-structured codebase that follows React best practices.
