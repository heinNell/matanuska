---
applyTo: "**"
---

# Code Quality Inspection Instructions

## 1. Import Analysis
- **Scope**: All files under `/src`
- **Actions**:
  - Verify each import statement for:
    - Path correctness (case-sensitive)
    - Actual usage in file
    - Circular dependency absence
  - Flag unused imports for removal

## 2. Usage Verification
- **Check Criteria**:
  - Files must be imported elsewhere or exported via barrel
  - Types/interfaces must be implemented/referenced
  - Components must be rendered/imported
  - Models must be instantiated/used
- **Validation Rules**:
  ```typescript
  isUsed = (
    isImported ||
    isExported ||
    isImplemented ||
    isReferenced
  )
  ```

## 3. Dead Code Elimination
- **Identification**:
  - Scan for unused:
    - Files
    - Components
    - Types/Interfaces
    - Models/Classes
- **Documentation**:
  ```
  format: {
    path: string
    type: 'file' | 'component' | 'type' | 'model'
    reason: string
    confidence: number // 0-1
  }
  ```
- **Action**:
  - confidence >= 0.8: Remove
  - confidence >= 0.5: Comment with TODO
  - confidence < 0.5: Flag for review

## 4. Type Coverage
- **Requirements**:
  - Every exported item must have explicit typing
  - Models must implement interfaces
  - Components must have prop types
- **Verification**:
  - Check type usage in:
    - Function parameters
    - Return types
    - Variable declarations
    - Class properties

## 5. Refactoring Guidelines
- **Priorities**:
  1. Tree-shaking optimization
     - Implement ES modules with named exports
     - Use dynamic imports for code splitting
     - Mark pure functions with /*#__PURE__*/ annotation
     - Remove side-effects from modules

  2. Circular dependency removal
     - Extract shared dependencies into separate modules
     - Use dependency injection patterns
     - Implement interface segregation
     - Create unidirectional data flow

  3. Type safety improvement
     - Add strict TypeScript compiler options
     - Implement discriminated unions for state
     - Use branded types for validation
     - Add runtime type checks

  4. Bundle size reduction
     - Implement code splitting by routes
     - Use webpack bundle analyzer
     - Configure tree-shaking options
     - Remove unused polyfills

- **Implementation Steps**:
  1. Analysis:
     - Run dependency graph analysis
     - Measure current bundle sizes
     - Document type coverage
     - Profile performance metrics

  2. Planning:
     - Create module boundaries
     - Define splitting points
     - Plan migration strategy
     - Set performance budgets

  3. Execution:
     - Refactor module structure
     - Update build configuration
     - Implement lazy loading
     - Add performance monitoring

- **Documentation Format**:
  ```typescript
  interface RefactoringChange {
    change: string;
    reason: string;
    impact: {
      size?: string;
      performance?: string;
      maintenance?: string;
    };
    priority: 1 | 2 | 3 | 4;
    effort: 'low' | 'medium' | 'high';
  }
  ```

## 6. Output Requirements
- **Summary Format**:
  ```
  {
    filesScanned: number
    issuesFound: number
    deadCodeBytes: number
    typesCoverage: percentage
    recommendations: Action[]
  }
  ```
- **Action Items**:
  - Prioritized list of changes
  - Impact assessment
  - Implementation steps
