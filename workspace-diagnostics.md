# Workspace Diagnostics

This document summarizes all errors and warnings found in the codebase.

## Summary

- **Total Files with Issues**: 14
- **ESLint Warnings**: 17
- **ESLint Errors**: 10
- **Parsing Errors**: 7

## Issues by File

### 1. Git SCM Input
- **Warning** (Line 1): 12 characters over 50 in current line

### 2. src/pages/wialon/WialonPlayground.tsx
- **Warning** (Line 26): Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-unused-vars')
- **Error** (Line 66): Unexpected any. Specify a different type.
- **Error** (Line 92): Unexpected any. Specify a different type.
- **Error** (Line 108): Unexpected any. Specify a different type.
- **Error** (Line 114): Unexpected any. Specify a different type. (repeated twice on same line)
- **Error** (Line 121): Unexpected any. Specify a different type.
- **Error** (Line 122): Unexpected any. Specify a different type.

### 3. src/App.tsx
- **Warning** (Line 5): 'TrackingPage' is defined but never used.
- **Warning** (Line 6): 'WialonPlayground' is defined but never used.
- **Warning** (Line 68): 'NormalizedError' is defined but never used.

### 4. src/services/WialonServiceComplete.ts
- **Warning** (Line 5): 'WialonSearchItemsResult' is defined but never used.
- **Warning** (Line 6): 'WialonFlags' is defined but never used.
- **Warning** (Line 191): 'DEFAULT_URL' is assigned a value but never used.
- **Error** (Line 381): Unexpected any. Specify a different type.
- **Error** (Line 383): Unexpected any. Specify a different type.

### 5. src/services/WialonDataManager.ts
- **Warning** (Line 17): 'WialonUser' is defined but never used.
- **Warning** (Line 18): 'WialonResource' is defined but never used.
- **Warning** (Line 19): 'WialonUnitGroup' is defined but never used.
- **Warning** (Line 20): 'WialonHardware' is defined but never used.
- **Warning** (Line 553): 'now' is defined but never used. Allowed unused args must match /^_/u.
- **Warning** (Line 627): 'table' is defined but never used. Allowed unused args must match /^_/u.
- **Warning** (Line 636): 'chart' is defined but never used. Allowed unused args must match /^_/u.

### 6. src/components/wialon/WialonGeofences.tsx
- **Warning** (Line 60): 'showMap' is assigned a value but never used. Allowed unused args must match /^_/u.
- **Warning** (Line 65): 'onGeofenceCreate' is defined but never used. Allowed unused args must match /^_/u.
- **Warning** (Line 66): 'onGeofenceEdit' is defined but never used. Allowed unused args must match /^_/u.

### 7. src/hooks/useWialonReports.ts
- **Parsing Error** (Line 43): ';' expected.

### 8. src/hooks/useWialonUnitSensors.ts
- **Parsing Error** (Line 57): ';' expected.

### 9. src/types/wialon.ts
- **Parsing Error** (Line 135): Unterminated string literal.

### 10. src/types/wialon-sensors.ts
- **Parsing Error** (Line 33): ';' expected.

### 11. src/services/wialonReportService.ts
- **Parsing Error** (Line 87): ';' expected.

### 12. src/hooks/useWialonGeofences.ts
- **Parsing Error** (Line 142): ';' expected.

### 13. src/hooks/useWialonResources.ts
- **Parsing Error** (Line 47): ';' expected.

### 14. src/types/WialonResourceTypes.ts
- **Parsing Error** (Line 10): Unterminated string literal.

### 15. src/context/WialonContext.tsx
- **Parsing Error** (Line 51): Unterminated string literal.

## Error Categories

### Syntax Errors
- **Unterminated string literals**: 3 files
- **Missing semicolons**: 5 files

### Type Safety Issues
- **Unexpected any**: 9 occurrences across 2 files

### Unused Code
- **Unused imports/variables**: 14 occurrences across 5 files
- **Unused eslint-disable directives**: 1 occurrence
