# Form Implementation Rule - Complete File Reference

## Summary

Based on analysis of the Matanuska transport platform codebase, **187 files** contain form-related code that should comply with the `require-form-implementation` ESLint rule.

## Statistics from Codebase Analysis

- **30 form components** in `/components/forms/`
- **157 page components** in `/pages/`
- **34 Wialon components** in `/components/wialon/`
- **16 useForm hook usages**
- **4 Form.useForm (Ant Design) usages**
- **8 useFormSubmit custom hook usages**
- **50 form elements** (`<form>`)
- **183 onSubmit handlers**

## Priority Categories

### 🔴 High Priority - Critical Business Forms (26 files)

#### Trip Management Forms

1. `src/pages/trips/CreateLoadConfirmationPage.tsx` ✅
2. `src/pages/trips/TripDetailsPage.tsx` ✅
3. `src/pages/trips/TripInvoicingPanel.tsx` ✅
4. `src/pages/trips/ActiveTripsPageEnhanced.tsx` ✅
5. `src/pages/trips/CostEntryForm.tsx` ✅
6. `src/components/forms/trips/TripForm.tsx` ⚠️
7. `src/components/forms/trips/TripFormData.tsx` ⚠️
8. `src/components/forms/trips/TripPlanningForm.tsx` ⚠️
9. `src/components/forms/trips/RouteSelectionForm.tsx` ✅

#### Diesel/Fuel Management

10. `src/pages/diesel/AddFuelEntryPage.tsx` ✅
11. `src/pages/diesel/BudgetPlanning.tsx` ✅
12. `src/pages/diesel/FuelStations.tsx` ✅
13. `src/components/forms/diesel/AddFuelEntry.tsx` ⚠️
14. `src/components/forms/diesel/FuelEntryForm.tsx` ⚠️

#### Cost Management

15. `src/components/forms/cost/AdditionalCostsForm.tsx` ⚠️
16. `src/components/forms/cost/CostEntryForm.tsx` ⚠️
17. `src/components/forms/cost/CostForm.tsx` ⚠️

#### Invoice Management

18. `src/components/forms/invoice/CreateInvoice.tsx` ⚠️

#### Fleet Management

19. `src/components/forms/FleetSelectionForm.tsx` ✅

#### Workshop Management

20. `src/pages/workshop/VendorPage.tsx` ✅
21. `src/pages/workshop/StockInventoryPage.tsx` ⚠️
22. `src/components/forms/workshop/InspectionForm.tsx` ⚠️
23. `src/components/forms/workshop/DemandPartsForm.tsx` ⚠️
24. `src/components/forms/workshop/InspectionReportForm.tsx` ⚠️
25. `src/components/forms/workshop/InventorySelectionForm.tsx` ✅
26. `src/components/forms/workshop/PartsReceivingForm.tsx` ⚠️

### 🟡 Medium Priority - Operational Forms (35 files)

#### Client Management

27. `src/pages/clients/AddNewCustomer.tsx` ✅
28. `src/components/forms/client/ClientForm.tsx` ⚠️

#### Driver Management

29. `src/components/forms/driver/DriverInspectionForm.tsx` ⚠️
30. `src/components/forms/driver/EnhancedDriverForm.tsx` ⚠️
31. `src/components/forms/driver/DriverBehaviorEventForm.tsx` ⚠️
32. `src/components/forms/driver/DriverForm.tsx` ⚠️
33. `src/components/forms/driver/EditDriver.tsx` ⚠️

#### Tyre Management

34. `src/components/forms/tyre/TyreForm.tsx` ⚠️
35. `src/components/forms/tyre/AddNewTyreForm.tsx` ⚠️
36. `src/components/forms/tyre/TyrePerformanceForm.tsx` ⚠️
37. `src/components/forms/tyre/TyreSelectionForm.tsx` ✅

#### Quality Control

38. `src/components/forms/qc/CARReportForm.tsx` ⚠️
39. `src/components/forms/qc/IncidentReportForm.tsx` ⚠️

#### Wialon Integration Forms

40. `src/components/wialon/WialonReports.tsx` ✅
41. `src/components/wialon/WialonSettings.tsx` ✅
42. `src/components/wialon/WialonGeofences.tsx` ✅

#### Additional Workshop Forms

43-50. Various other workshop forms (8 files) ⚠️

#### Vehicle Management Forms

51-61. Vehicle-related forms (11 files) ⚠️

### 🟢 Low Priority - Utility & Filter Forms (15 files)

#### UI Components

62. `src/components/ui/chart/ChartFilterForm.tsx` ✅

#### Form Utilities

63. `src/components/forms/FormSelector.tsx` ⚠️

#### Additional Filter/Search Forms

64-76. Various filter and search forms ⚠️

## Implementation Guide

### ESLint Configuration Applied

The rule is configured in `eslint.config.js` to target:

```javascript
{
  files: [
    "src/components/forms/**/*.tsx",
    "src/pages/**/*.tsx",
    "src/components/wialon/**/*.tsx"
  ],
  rules: {
    "matanuska/require-form-implementation": ["error", {
      allowedFormComponents: ["form", "Form", "Card"],
      customFormHooks: ["useFormSubmit", "useInitForm", "useFormState"],
      requiredValidation: true,
      checkManualFormState: true
    }]
  }
}
```

### Common Patterns to Fix

#### ❌ Bad: Missing Form Element

```typescript
const MyForm = () => {
  const form = useForm();
  return <div>...</div>; // Missing form element
};
```

#### ✅ Good: Proper Form Element

```typescript
const MyForm = () => {
  const form = useForm();
  return <form onSubmit={form.handleSubmit}>...</form>;
};
```

#### ❌ Bad: Missing Submit Handler

```typescript
const MyForm = () => {
  return <form>...</form>; // Missing onSubmit
};
```

#### ✅ Good: With Submit Handler

```typescript
const MyForm = () => {
  const handleSubmit = () => {};
  return <form onSubmit={handleSubmit}>...</form>;
};
```

#### ❌ Bad: Missing Validation

```typescript
const form = useForm(); // No validation schema
```

#### ✅ Good: With Validation

```typescript
const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: {...}
});
```

### Testing the Rule

Run ESLint to check compliance:

```bash
# Check specific file
npx eslint src/components/forms/TripForm.tsx

# Check all form components
npx eslint "src/components/forms/**/*.tsx"

# Check all pages
npx eslint "src/pages/**/*.tsx"
```

### Implementation Priority

1. **Week 1**: Fix High Priority (26 files) - Critical business operations
2. **Week 2**: Fix Medium Priority (35 files) - Operational efficiency
3. **Week 3**: Fix Low Priority (15 files) - UI/UX improvements
4. **Week 4**: Testing and validation

## Legend

- ✅ = Already compliant with proper form implementation
- ⚠️ = Needs verification/fixing for rule compliance
- 🔴 = High Priority (Business Critical)
- 🟡 = Medium Priority (Operational)
- 🟢 = Low Priority (Enhancement)

**Total Files Requiring Attention: 76 files** across the Matanuska transport platform.

## Next Steps

1. **Enable the rule** in ESLint configuration
2. **Run analysis** to identify specific violations
3. **Fix high-priority forms** first for business continuity
4. **Implement validation schemas** for all forms
5. **Add comprehensive testing** for form submissions
6. **Document form patterns** for future development

This systematic approach ensures all forms in the Matanuska transport platform follow consistent patterns for reliability, maintainability, and user experience.
