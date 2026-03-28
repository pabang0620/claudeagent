---
name: checkpoint
description: "Creates, verifies, and lists workflow checkpoints with git integration. Triggers on 'checkpoint', 'save checkpoint', 'compare checkpoint', 'list checkpoints', or 'rollback to checkpoint'."
disable-model-invocation: true
allowed-tools: Bash, Read, Grep
---

# Checkpoint

Creates or verifies checkpoints in the workflow, tracking progress via git commits and a checkpoint log.

## Arguments

$ARGUMENTS determines the action:
- `create <name>` - Create a checkpoint with the given name
- `verify <name>` - Compare current state against the named checkpoint
- `list` - Show all checkpoints
- `clear` - Remove old checkpoints (keep the most recent 5)

If $ARGUMENTS is empty, default to `list`.

## Create Checkpoint

1. Run a quick verification to confirm the current state is clean:

```bash
npm run build 2>&1 | tail -5
npx tsc --noEmit 2>&1 | tail -5
```

2. Create a git commit with the checkpoint name:

```bash
git add -A && git commit -m "checkpoint: $CHECKPOINT_NAME"
```

3. Record the checkpoint in `.claude/checkpoints.log`:

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. Report checkpoint creation with the git SHA.

## Verify Checkpoint

1. Read the checkpoint log to find the named checkpoint:

```bash
grep "$CHECKPOINT_NAME" .claude/checkpoints.log
```

2. Compare current state against the checkpoint:

```bash
# Files changed since checkpoint
git diff --stat $CHECKPOINT_SHA..HEAD

# Files added since checkpoint
git diff --name-status $CHECKPOINT_SHA..HEAD
```

3. Run tests and report current pass/fail and coverage.

4. Produce a comparison report:

```
CHECKPOINT COMPARISON: $NAME
============================
Files changed: X
Tests: +Y passed / -Z failed
Coverage: +X% / -Y%
Build: [PASS/FAIL]
```

## List Checkpoints

Read and display `.claude/checkpoints.log` with:
- Name
- Timestamp
- Git SHA
- Status relative to HEAD (current, behind N commits, ahead N commits)

```bash
cat .claude/checkpoints.log 2>/dev/null || echo "No checkpoints found."
```

For each checkpoint, show how many commits it is behind HEAD:

```bash
git rev-list --count $SHA..HEAD
```

## Clear Checkpoints

Keep only the most recent 5 entries in `.claude/checkpoints.log`:

```bash
tail -5 .claude/checkpoints.log > .claude/checkpoints.log.tmp && mv .claude/checkpoints.log.tmp .claude/checkpoints.log
```

Report how many checkpoints were removed.
