# Routing & Navigation System - Testing Guide

## Overview

This document provides guidance on testing the hierarchical routing system implemented for the Matanuska Transport Platform. Our implementation connects all 407 components through a structured navigation system, organized into logical sections with parent-child relationships.

## Test Components

1. **SidebarTester.tsx**: A visual testing tool to navigate through the routes
2. **test-routing.sh**: Basic script to verify the routing configuration
3. **test-routing-advanced.sh**: Comprehensive script to validate all aspects of routing
4. **routing.test.tsx**: Jest test suite for automated testing

## Quick Start

Run these commands to test the routing system:

```bash
# Basic routing checks
npm run test:routing

# Visual sidebar and navigation testing
npm run test:sidebar
```

## Test Scenarios

### 1. Sidebar Navigation

- **Test**: Click through each section in the sidebar to verify it opens/closes correctly
- **Verify**: Child routes appear when a parent section is expanded
- **Expected**: All sections render without errors and show correct child items

### 2. Route Navigation

- **Test**: Click on individual routes to navigate to different pages
- **Verify**: The correct component loads for each route
- **Expected**: The URL changes and the appropriate component renders

### 3. Nested Routes

- **Test**: Navigate to Workshop → Maintenance Scheduler → Maintenance Templates
- **Verify**: The proper component loads with proper URL nesting
- **Expected**: The URL reflects the hierarchy (/workshop/maintenance-scheduler/templates)

### 4. Lazy Loading

- **Test**: Monitor network requests when navigating between routes
- **Verify**: Components are loaded on demand, not all at once
- **Expected**: Network activity shows components loading when their routes are accessed

### 5. Error Handling

- **Test**: Try to navigate to a non-existent route (e.g., /does-not-exist)
- **Verify**: The 404 catch-all route handles the request
- **Expected**: A 404 page displays

## Manual Testing Checklist

- [ ] All main navigation sections are visible in the sidebar
- [ ] Child routes appear when parent sections are expanded
- [ ] All routes navigate to the correct components
- [ ] Nested routes work correctly with appropriate URL paths
- [ ] The 404 page appears for invalid routes
- [ ] No console errors occur during navigation
- [ ] The navigation is responsive and works on mobile devices

## Automated Testing

To run the comprehensive automated test suite:

```bash
# Run Jest tests for routing
npm test -- routing.test.tsx
```

## Integration Testing

To verify integration with the rest of the application:

1. Navigate to the dashboard
2. Perform a workflow that crosses multiple sections (e.g., create a trip, then check its invoice)
3. Verify navigation between related components works seamlessly

## Expected Results

- **Sidebar Config**: All 407 components accessible through the navigation
- **Hierarchical Structure**: Parent-child relationships work correctly
- **Lazy Loading**: Components load only when needed
- **Error Handling**: Invalid routes handled gracefully

## Troubleshooting

If issues are encountered during testing:

1. Check the browser console for errors
2. Verify the component path in sidebarConfig.ts matches the actual import path
3. Ensure all required components exist in the codebase
4. Check for circular dependencies in component imports

## UI Interaction Testing

### Button Functionality Verification

- **Edit Buttons**: Verify all "Edit" buttons open the correct edit form for the item
- **View Buttons**: Verify all "View" buttons open the correct detail view
- **Delete Buttons**: Verify all "Delete" buttons trigger the correct deletion process with confirmation
- **Save Buttons**: Verify all "Save" buttons correctly persist changes
- **Cancel Buttons**: Verify all "Cancel" buttons properly abandon changes

### Form Functionality Testing

- **Form Submission**: Test that forms submit data to the correct endpoints
- **Form Validation**: Verify required fields, data formats, and validation errors
- **Form Population**: Ensure edit forms are pre-populated with existing data
- **Form Relationships**: Test that related data (dropdowns, autocomplete) loads correctly
- **Form Feedback**: Verify success/error messages appear appropriately

### Modal and Dialog Testing

- **Modal Opening**: Test that modals open correctly from their trigger elements
- **Modal Closing**: Verify modals can be closed via close button, escape key, and clicking outside
- **Dialog Interaction**: Test confirmation dialogs for destructive actions
- **Dialog State**: Ensure dialogs maintain state correctly when reopened

## Component Integration Tests

| Component | Action | Expected Result | Status |
|-----------|--------|-----------------|--------|
| Trip Management | Click "Add Trip" | Add Trip form opens | □ |
| Trip Management | Click "View Trip" on a trip | Trip details page opens | □ |
| Invoice Dashboard | Click "Create Invoice" | Invoice creation form opens | □ |
| Diesel Management | Click "Add Fuel Entry" | Fuel entry form opens | □ |
| Driver Dashboard | Click "Add Driver" | New driver form opens | □ |
| Workshop | Click "Create Job Card" | Job card creation form opens | □ |

## Cross-Component Workflow Tests

1. **Trip to Invoice Flow**:
   - Create a new trip
   - Navigate to invoices section
   - Verify trip appears in available trips for invoicing
   - Create invoice from trip
   - Verify invoice contains correct trip data

2. **Driver to Trip Assignment Flow**:
   - Add a new driver
   - Navigate to trip management
   - Assign the new driver to a trip
   - Verify driver appears in trip details

3. **Vehicle Inspection to Workshop Flow**:
   - Create a vehicle inspection with defects
   - Navigate to workshop section
   - Verify inspection defects appear in maintenance tasks
   - Create job card from defect
   - Verify job card contains correct defect information

## Future Test Enhancements

- End-to-end testing with Cypress or Playwright
- Performance testing for lazy loading
- Accessibility testing of the navigation system
- User acceptance testing with real users
- Automated UI interaction tests
