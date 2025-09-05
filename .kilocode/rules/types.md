# types.md

# TypeScript Best Practices: Avoiding `any`

When dealing with the `@typescript-eslint/no-explicit-any` rule, here are the best practices for maintaining type safety:

## 1. Use Specific Types and Interfaces

```typescript
// Instead of:
function processUser(user: any): any { ... }

// Better:
interface User {
  id: string;
  name: string;
  email: string;
  preferences?: UserPreferences;
}

function processUser(user: User): UserResult { ... }
```

## 2. Use `unknown` for Truly Unknown Types

```typescript
// Instead of any:
function processData(data: unknown): void {
  // Requires type checking before use
  if (typeof data === 'string') {
    // TypeScript knows data is string here
  }
}
```

## 3. For Objects with Dynamic Properties

```typescript
// Instead of:
const config: any = {};

// Better:
const config: Record<string, unknown> = {};
// Or more specific:
const config: Record<string, string | number | boolean> = {};
```

## 4. For Function Parameters or Returns

```typescript
// Use generics instead of any:
function transform<T, R>(input: T, transformFn: (value: T) => R): R {
  return transformFn(input);
}
```

## 5. For API Responses

```typescript
// Define proper interfaces:
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Use unknown if shape is uncertain:
async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  return await response.json() as ApiResponse<T>;
}
```

## 6. For Event Handlers

```typescript
// Instead of:
const handleClick = (event: any) => { ... }

// Better:
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => { ... }
```

## 7. For Component Props

```typescript
// Instead of generic props:any
interface ButtonProps {
  onClick?: () => void;
  label: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

function Button(props: ButtonProps) { ... }
```

## Key Benefits

- **Better autocomplete**: IDE provides accurate suggestions
- **Catching errors earlier**: Compile-time vs runtime errors
- **Self-documenting code**: Types serve as documentation
- **Safer refactoring**: TypeScript flags issues when changing related code
- **Improved maintainability**: New developers understand expectations

The extra effort to define proper types pays off significantly in reduced bugs and improved code quality in the long run.


## Guidelines

- Guideline 1
- Guideline 2
