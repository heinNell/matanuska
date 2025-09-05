# Files Requiring Form Implementation Rule Application

## Overview

This document lists all files in the Matanuska transport platform that use form hooks or form elements and need to comply with the `require-form-implementation` ESLint rule.

## Form Hook Usage Files

### Pages with Form.useForm() (Ant Design Forms)

1. **`src/pages/diesel/AddFuelEntryPage.tsx`**
   - Uses: `Form.useForm()`
   - Status: ✅ Has proper form implementation

2. **`src/pages/diesel/BudgetPlanning.tsx`**
   - Uses: `Form.useForm()`
   - Status: ✅ Has proper form implementation

3. **`src/pages/diesel/FuelStations.tsx`**
   - Uses: `Form.useForm()`
   - Status: ✅ Has proper form implementation

4. **`src/pages/clients/AddNewCustomer.tsx`**
   - Uses: `Form.useForm()`
   - Status: ✅ Has proper form implementation

### React Hook Form Usage

5. **`src/components/forms/TripForm.tsx`**
   - Uses: `useForm` from react-hook-form
   - Status: ⚠️ Needs verification - uses any type

6. **`src/components/ui/chart/ChartFilterForm.tsx`**
   - Uses: `useForm` from react-hook-form with Zod schema
   - Status: ✅ Has proper form implementation with validation

### Custom Form Hooks

7. **`src/components/forms/workshop/InventorySelectionForm.tsx`**
   - Uses: `useFormSubmit` custom hook
   - Status: ⚠️ Needs verification

8. **`src/components/forms/trips/RouteSelectionForm.tsx`**
   - Uses: `useFormSubmit` custom hook
   - Status: ⚠️ Needs verification

9. **`src/components/forms/tyre/TyreSelectionForm.tsx`**
   - Uses: `useFormSubmit` custom hook
   - Status: ⚠️ Needs verification

10. **`src/components/forms/FleetSelectionForm.tsx`**
    - Uses: `useFormSubmit` custom hook
    - Status: ⚠️ Needs verification

## Form Element Usage Files

### Pages with Form Elements and Submit Handlers

11. **`src/pages/trips/CreateLoadConfirmationPage.tsx`**
    - Has: `<form onSubmit={handleSubmit}>`
    - Status: ✅ Properly implemented

12. **`src/pages/trips/TripDetailsPage.tsx`**
    - Has: Multiple `onSubmit` handlers
    - Status: ✅ Properly implemented

13. **`src/pages/workshop/VendorPage.tsx`**
    - Has: `<form onSubmit={handleSubmit}>`
    - Status: ✅ Properly implemented

14. **`src/pages/trips/TripInvoicingPanel.tsx`**
    - Has: `<form onSubmit={handleSubmit}>`
    - Status: ✅ Properly implemented

15. **`src/pages/trips/ActiveTripsPageEnhanced.tsx`**
    - Has: Multiple form implementations
    - Status: ✅ Properly implemented

16. **`src/pages/trips/CostEntryForm.tsx`**
    - Has: `<form onSubmit={handleSubmit}>`
    - Status: ✅ Properly implemented

### Manual Form State Management

17. **`src/pages/workshop/StockInventoryPage.tsx`**
    - Uses: `useState` for form data management
    - Status: ⚠️ Needs form element verification

## Complete Form Components Directory

All files in `src/components/forms/` should be checked:

### Cost Forms

18. **`src/components/forms/cost/AdditionalCostsForm.tsx`**
19. **`src/components/forms/cost/CostEntryForm.tsx`**
20. **`src/components/forms/cost/CostForm.tsx`**

### Invoice Forms

21. **`src/components/forms/invoice/CreateInvoice.tsx`**

### Tyre Forms

22. **`src/components/forms/tyre/TyreForm.tsx`**
23. **`src/components/forms/tyre/AddNewTyreForm.tsx`**
24. **`src/components/forms/tyre/TyrePerformanceForm.tsx`**
25. **`src/components/forms/tyre/TyreSelectionForm.tsx`** (already listed)

### Workshop Forms

26. **`src/components/forms/workshop/InspectionForm.tsx`**
27. **`src/components/forms/workshop/DemandPartsForm.tsx`**
28. **`src/components/forms/workshop/InspectionReportForm.tsx`**
29. **`src/components/forms/workshop/InventorySelectionForm.tsx`** (already listed)
30. **`src/components/forms/workshop/PartsReceivingForm.tsx`**

### Trip Forms

31. **`src/components/forms/trips/TripFormData.tsx`**
32. **`src/components/forms/trips/TripPlanningForm.tsx`**
33. **`src/components/forms/trips/RouteSelectionForm.tsx`** (already listed)
34. **`src/components/forms/trips/TripForm.tsx`**

### Client Forms

35. **`src/components/forms/client/ClientForm.tsx`**

### Utility Forms

36. **`src/components/forms/FormSelector.tsx`**

## Wialon Integration Forms (New Phase 3 Components)

37. **`src/components/wialon/WialonReports.tsx`**
    - Multiple form elements for report configuration
    - Status: ✅ Properly implemented

38. **`src/components/wialon/WialonSettings.tsx`**
    - Complex form with tabbed interface
    - Status: ✅ Properly implemented

39. **`src/components/wialon/WialonGeofences.tsx`**
    - Form elements for geofence management
    - Status: ✅ Properly implemented

## ESLint Rule Configuration

Update your ESLint configuration to apply the rule to these files:

```javascript
// .eslintrc.js
module.exports = {
  // ... other config
  rules: {
    "matanuska/require-form-implementation": [
      "error",
      {
        allowedFormComponents: ["form", "Form", "Card"],
        requiredValidation: true,
        customFormHooks: ["useFormSubmit", "useInitForm", "useFormState"],
        excludePatterns: ["**/*.test.tsx", "**/*.stories.tsx"],
      },
    ],
  },
  overrides: [
    {
      files: [
        "src/components/forms/**/*.tsx",
        "src/pages/**/*.tsx",
        "src/components/wialon/**/*.tsx",
      ],
      rules: {
        "matanuska/require-form-implementation": "error",
      },
    },
  ],
};
```

## Priority Implementation Order

### High Priority (Critical Forms)

1. Trip management forms (safety and operational critical)
2. Diesel/fuel management forms (cost control)
3. Workshop forms (maintenance compliance)
4. Invoice forms (financial accuracy)

### Medium Priority

1. Client management forms
2. Tyre management forms
3. Wialon integration forms

### Low Priority

1. Utility and helper forms
2. Chart filter forms
3. Configuration forms

## Common Patterns to Fix

### Pattern 1: Missing Form Validation

```typescript
// Bad
const { handleSubmit } = useForm();

// Good
const { handleSubmit } = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: {...}
});
```

### Pattern 2: Missing Submit Handler

```typescript
// Bad
<form>
  <input name="field" />
  <button type="submit">Submit</button>
</form>

// Good
<form onSubmit={handleSubmit}>
  <input name="field" />
  <button type="submit">Submit</button>
</form>
```

### Pattern 3: Form Hook Without Form Element

```typescript
// Bad
const form = useForm();
return <div>...</div>; // No form element

// Good
const form = useForm();
return <form onSubmit={form.handleSubmit}>...</form>;
```

## Implementation Steps

1. **Update ESLint Rule** - Enhance the rule to detect custom hooks
2. **Run ESLint Check** - Identify all violations
3. **Fix High Priority** - Address critical forms first
4. **Add Tests** - Ensure form validation works
5. **Document Patterns** - Create form development guidelines
6. **Review and Refactor** - Optimize form implementations

Total files requiring attention: **39 files** across the Matanuska transport platform.
