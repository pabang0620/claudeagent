---
name: verify
description: "Comprehensive validation loop for codebase state. Checks build, types, lint, tests, console.log, and git status. Use when the user says 'verify', 'check everything', 'pre-commit check', or 'is it ready for PR'."
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob
---

# Verify

Runs a comprehensive verification of the current codebase state and produces a concise report.

## Arguments

$ARGUMENTS determines the mode:
- `quick` - Build + type check only
- `full` - All checks (default if no argument)
- `pre-commit` - Commit-related checks (build, types, lint, console.log, git status)
- `pre-pr` - Full checks + security scan

If $ARGUMENTS is empty, default to `full`.

## Steps

### 1. Build Check

Run the project build command:

```bash
npm run build 2>&1 | tail -20
```

If build fails, report the error and stop. Do not proceed to further steps.

### 2. Type Check

Run TypeScript type checker:

```bash
npx tsc --noEmit 2>&1 | head -30
```

Report all errors with file:line format.

If mode is `quick`, stop here and produce the report.

### 3. Lint Check

Run the linter:

```bash
npm run lint 2>&1 | head -30
```

Report warnings and errors.

### 4. Test Suite

Run all tests with coverage:

```bash
npm test -- --coverage 2>&1 | tail -50
```

Report pass/fail counts and coverage percentage.

### 5. Console.log Audit

Search source files for console.log statements:

```bash
grep -rn "console.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ 2>/dev/null | head -20
```

Report locations found.

### 6. Git Status

Show uncommitted changes and modified files since last commit:

```bash
git status --short
git diff --stat HEAD
```

### 7. Security Scan (pre-pr mode only)

If mode is `pre-pr`, also run:

```bash
# Check for hardcoded secrets
grep -rn "sk-" --include="*.ts" --include="*.js" src/ 2>/dev/null | head -10
grep -rn "api_key\|apiKey\|API_KEY" --include="*.ts" --include="*.js" src/ 2>/dev/null | head -10
npm audit --audit-level=high 2>&1 | tail -20
```

## Output Format

Produce a concise verification report:

```
Verification: [PASS/FAIL]

Build:    [OK/FAIL]
Types:    [OK/X errors]
Lint:     [OK/X issues]
Tests:    [X/Y passed, Z% coverage]
Secrets:  [OK/X found]
Logs:     [OK/X console.logs]

PR Ready: [YES/NO]
```

If critical issues exist, list them with suggested fixes.
