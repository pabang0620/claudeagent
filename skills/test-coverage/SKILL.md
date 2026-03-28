---
name: test-coverage
description: "Analyzes test coverage, identifies files below the 80% threshold, and generates missing tests. Triggers on 'test coverage', 'check coverage', 'coverage report', 'generate missing tests', or 'improve coverage'."
allowed-tools: Bash, Read, Write, Edit, Grep, Glob
---

# Test Coverage

Analyzes test coverage across the project, identifies gaps, and generates tests to reach the 80% minimum threshold.

## Steps

### 1. Run Tests with Coverage

Execute tests with coverage reporting:

```bash
npm test -- --coverage 2>&1 | tail -50
```

Or if using pnpm:

```bash
pnpm test --coverage 2>&1 | tail -50
```

### 2. Analyze Coverage Report

Read the coverage summary:

```bash
cat coverage/coverage-summary.json 2>/dev/null
```

Parse the JSON to identify:
- Overall project coverage percentage
- Per-file coverage breakdown (statements, branches, functions, lines)

### 3. Identify Files Below Threshold

List all files with less than 80% coverage. Sort by lowest coverage first. For each file, note:
- Current coverage percentage
- Number of uncovered lines
- Uncovered line ranges

### 4. Generate Missing Tests

For each file below the 80% threshold:

1. Read the source file to understand its functionality.
2. Analyze uncovered code paths (branches, error handlers, edge cases).
3. Generate appropriate tests:
   - **Unit tests** for individual functions and utilities
   - **Integration tests** for API endpoints and database operations
   - **E2E tests** for critical user-facing flows
4. Focus test generation on:
   - Happy path scenarios
   - Error handling paths
   - Edge cases (null, undefined, empty values)
   - Boundary conditions

### 5. Verify New Tests Pass

Run the newly created tests to confirm they pass:

```bash
npm test -- --coverage 2>&1 | tail -50
```

Fix any failing tests before proceeding.

### 6. Report Results

Display a before/after comparison:

```
TEST COVERAGE REPORT
====================

Before:
  Overall: X%
  Files below 80%: N

After:
  Overall: Y%
  Files below 80%: M

New tests created: Z
  - path/to/test1.test.ts
  - path/to/test2.test.ts

Remaining gaps:
  - file1.ts: X% (needs manual review)
```

Ensure the project reaches 80%+ overall coverage. If not achievable in a single pass, list remaining gaps with specific recommendations.
