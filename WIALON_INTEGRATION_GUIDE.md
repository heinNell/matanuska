# Wialon API Integration Guide

## Overview

This integration provides a working Wialon API solution that matches your successful curl request pattern. It includes authentication, units fetching, and React components ready to use.

## Files Created

1. **Authentication Service**: `src/services/wialonAuthService.ts`
2. **Units API Service**: `src/services/wialonUnitsService.ts`
3. **Authentication Context**: `src/context/WialonAuthContext.tsx`
4. **Units Hook**: `src/hooks/useWialonApiUnits.ts`
5. **Login Modal**: `src/components/Models/wialon/WialonLoginModal.tsx` (updated)
6. **Test Component**: `src/components/WialonLoginTest.tsx`
7. **Fleet Dashboard**: `src/components/dashboard/WialonFleetDashboard.tsx`

## How Your curl Request Translates

Your successful curl request:
```bash
curl -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=core/search_items' \
  --data-urlencode 'params={"spec":{"itemsType":"avl_unit","propName":"sys_name","propValueMask":"*","sortType":"sys_name"},"force":1,"flags":1,"from":0,"to":0}' \
  --data-urlencode 'sid=5123e104151474518cabed3d7e5f1a11'
```

Is now implemented as:
```typescript
// In src/services/wialonUnitsService.ts
export async function searchWialonUnits(sessionId: string) {
  const formData = new URLSearchParams();
  formData.append('svc', 'core/search_items');
  formData.append('params', JSON.stringify({
    "spec": {
      "itemsType": "avl_unit",
      "propName": "sys_name",
      "propValueMask": "*",
      "sortType": "sys_name"
    },
    "force": 1,
    "flags": 1,
    "from": 0,
    "to": 0
  }));
  formData.append('sid', sessionId);

  // ... rest of fetch logic
}
```

## Integration Steps

### 1. Add to Your App Component
```tsx
import { WialonAuthProvider } from './context/WialonAuthContext';

function App() {
  return (
    <WialonAuthProvider>
      {/* Your existing app content */}
    </WialonAuthProvider>
  );
}
```

### 2. Use in Components
```tsx
import { useWialonAuth } from '../context/WialonAuthContext';
import { useWialonApiUnits } from '../hooks/useWialonApiUnits';

function FleetComponent() {
  const { isLoggedIn, loginData } = useWialonAuth();
  const { units, loading, error } = useWialonApiUnits();

  if (!isLoggedIn) {
    return <WialonLoginModal />;
  }

  return (
    <div>
      <h2>Fleet: {units.length} units</h2>
      {units.map(unit => (
        <div key={unit.id}>{unit.nm}</div>
      ))}
    </div>
  );
}
```

### 3. Manual API Calls
```tsx
import { searchWialonUnits } from '../services/wialonUnitsService';

// In a component or service
const fetchUnits = async () => {
  try {
    const response = await searchWialonUnits(sessionId);
    console.log('Units:', response.items);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## API Response Format

Your units will be returned in this format (matching your curl response):
```typescript
interface WialonUnit {
  nm: string;          // Unit name - "21H - ADS 4865"
  cls: number;         // Class - 2 (for units)
  id: number;          // Unit ID - 600665449
  mu: number;          // Modified/Update flags - 0
  uacl: number;        // User access control level - 4178835472383
}
```

## Testing

1. **Test the Login**: Use `WialonLoginTest` component
2. **Test Units Fetching**: Login and units should auto-load
3. **Test Dashboard**: Use `WialonFleetDashboard` component

## Environment Variables

Optional: Set these in your `.env` file:
```
VITE_WIALON_API_URL=https://hst-api.wialon.com
```

## Next Steps

1. Test with your token in the login modal
2. Verify units are fetched correctly
3. Integrate into your existing Fleet components
4. Add error handling and loading states as needed
5. Extend with additional Wialon API calls (sensors, reports, etc.)

## Error Handling

The system includes comprehensive error handling:
- Network errors
- Wialon API errors (with error codes)
- Session expiry
- Invalid tokens

All errors are propagated to React components via hooks and context.
