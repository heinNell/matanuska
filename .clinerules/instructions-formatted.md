---
title: Code Quality & Data Integrity Policy
applyTo: "**"
version: 1.0
effective: 2025-09-01
owner: Engineering PMO
status: enforced
---

# Code Quality & Data Integrity Policy

## 0) Purpose (non-negotiable)

Protect production integrity and analytical trust. No files or code are deleted casually. No mock/synthetic data is used anywhere. All changes must preserve end-to-end behavior unless explicitly approved.

---

## 1) Non-Deletion & Change Control

- **Hard rule:** **No deletions** of files, exports, models, components, schemas, migrations, or routes **without prior written approval** (see §6).
- **Allowed without approval:** Purely additive changes (new files, non-breaking exports), comments, docs, test additions that do not stub or fake data.
- **Soft-delete first:** If decommissioning is necessary, **quarantine** instead of deleting:
  - Move to `/_archive/<yyyy-mm>/...` **or** disable via feature flag.
  - Add `/_archive/<yyyy-mm>/README.md` explaining rationale and rollback steps.
- **Refactors:** Must be behavior-preserving with identical public APIs. Any breaking change requires approval (§6).

---

## 2) Real-Data-Only (No Mocks, No Fakes)

- **Prohibited anywhere (including tests):** `msw`, `nock`, `faker`, `chance`, synthetic JSON fixtures, ad-hoc `sample*.json`, stubbed endpoints, hard-coded demo data.
- **Required:** Use **sanitized production snapshots** or **read-only staging replicas** sourced from the real backend.
  - Sanitization must retain **true cardinalities, distributions, and edge cases**.
  - Redaction is permitted for sensitive fields, but records must remain real.
- **Tests:** Integration/E2E tests must call a real (staging/read-only) service or sanctioned snapshot with documented provenance.

---

## 3) Full Integration (Backend ↔ Frontend)

- Every UI path that surfaces operational/financial/logistics data **must** bind to live APIs or sanctioned snapshots.
- Feature work must include:
  - **Contract tests** validating request/response shapes.
  - **Runtime validation** (e.g., zod/io-ts/valibot) at IO boundaries.
  - **Observability hooks**: logs/metrics for success, failure, and data anomalies.

---

## 4) Code Quality Inspection Instructions (Enforced)

**Scope:** `/src/**`

### 4.1 Import Analysis

- Verify: path **case-sensitivity**, **actual usage**, **no circular dependencies**.
- Flag unused imports with `// TODO[unused-import]: justification required`. Do **not** auto-delete (see §1).

### 4.2 Usage Verification

A symbol/file is **used** if:

```typescript
isUsed = isImported || isExported || isImplemented || isReferenced;
```

If not used: flag only with rationale. Do not delete (§1).

### 4.3 Dead Code Elimination

Disabled by default. Perform identification only and emit a report with:

```go
{
  path: string
  type: 'file' | 'component' | 'type' | 'model'
  reason: string
  confidence: number // 0-1
}
```

**Action mapping:**

- ≥ 0.8: Propose removal via approval workflow (§6).
- 0.5–0.79: Add `// TODO` + tracking ticket.
- < 0.5: Flag for manual review.

### 4.4 Type Coverage

- All exports must have explicit types.
- Components: strict, explicit prop interfaces.
- Models: must implement declared interfaces; no any.
- Require explicit types for function params/returns, variables, class properties; prefer discriminated unions for state.

---

## 5) Refactoring Guardrails (Priority Order)

1. **Tree-shaking:** Named ESM exports; dynamic imports at route/screen boundaries; annotate pure fns with `/*#__PURE__*/`; remove module side-effects.
2. **Circulars:** Extract shared contracts to leafless packages; apply DI; enforce unidirectional data flow.
3. **Type safety:** strict + noUncheckedIndexedAccess; branded types for IDs; runtime schema validation at IO edges.
4. **Bundle size:** Route-level code splitting; analyzer-driven budgets; remove unused polyfills/legacy shims.

**Phases:**

- **Analysis:** dependency graph, bundle sizes, type coverage %, perf baselines.
- **Planning:** module boundaries, split points, migration steps, perf budgets.
- **Execution:** restructure modules, update build config, enable lazy loading, wire monitoring.

**Change log entry format:**

```typescript
interface RefactoringChange {
  change: string;
  reason: string;
  impact: { size?: string; performance?: string; maintenance?: string };
  priority: 1 | 2 | 3 | 4;
  effort: "low" | "medium" | "high";
}
```

---

## 6) Exception & Approval Workflow (Required Before Deletions/Breaking Changes)

Open a Change Request (CR) ticket:

- **Title:** [CR] Removal/Breaking change for `<module>`
- **Rationale:** measurable benefit (size, perf, safety, risk).
- **Blast radius:** impacted packages/routes/types.
- **Rollback plan:** restore path or revert SHA.
- **Data impact:** confirm no negative change to data lineage/KPIs.
- **PR labels:** needs-approval, potential-breaking-change.
- **Minimum approvers:** Tech Lead + Product Owner (and Data Lead if analytics affected).

Only after approval → proceed and update archive + CHANGELOG.

---

## 7) CI/CD Enforcement (Fail-Fast)

Pipelines must fail when:

- Mock/dev-only libraries/files detected (msw, faker, chance, _.mock._, **mocks**, sample\*.json, fixtures/ without provenance).
- Import cycles detected.
- Un-typed exports found.
- API boundary code lacks runtime validation.
- PR contains deletions/renames without an approved CR (§6).
- Frontend route/component has no real backend binding or sanctioned snapshot.

**CI must also publish a summary artifact:**

```json
{
  "filesScanned": <number>,
  "issuesFound": <number>,
  "deadCodeBytes": <number>,
  "typesCoverage": "<percentage>",
  "recommendations": [ /* RefactoringChange[] */ ]
}
```

---

## 8) PR Review Checklist (All Required)

- [ ] No deletions/renames without approved CR.
- [ ] No mocks, stubs, synthetic fixtures anywhere.
- [ ] All exports explicitly typed; components have typed props.
- [ ] Backend contracts tested and validated at runtime.
- [ ] Observability added/updated (logs/metrics).
- [ ] Sensitive data redaction preserves real-world semantics.
- [ ] Clear, tested rollback path.

---

## 9) Templates

### A) Change Request (CR) – Removal/Breaking

```yaml
Context:
Proposed change:
Rationale (metrics/OKRs):
Impact (modules/routes/types):
Data lineage impact:
Risk & mitigation:
Rollback steps:
Owners & approvers:
Target release window:
```

### B) Data Snapshot Provenance

```yaml
Source system:
Snapshot date/time:
Sanitization applied:
Sensitive fields redacted:
Record counts by table/collection:
Known limitations:
Owner:
```

---

## 10) Final Notes

This policy supersedes any automated "auto-cleanup." Tools may suggest, not delete.

If something truly must be removed, request approval first via the CR workflow (§6). Only then proceed.
