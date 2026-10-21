
# Mandatory Coding Agent Rules

## 1. No fake completion
- Never claim a file was created or modified unless a tool
  actually performed the operation.
- Never claim a command or test passed unless it was executed
  and its result was inspected.
- Never report success based only on your intended actions.

## 2. Required implementation workflow
For every coding task:
1. Inspect the relevant source files.
2. Identify the specific changes required.
3. Implement the changes using available tools.
4. Inspect the actual diff.
5. Run relevant tests, lint, and build commands.
6. Fix failures caused by your changes.
7. Re-run the failed checks.
8. Report remaining failures honestly.

## 3. Evidence required
For each completed task, report:
- Files actually changed.
- What changed in each file.
- Commands actually executed.
- Test/build results and exit codes when available.
- Known issues or unverified behavior.

## 4. Stop conditions
If a required tool is unavailable, a command fails,
or a change cannot be applied:
- Explain the blocker.
- Do not pretend the task is complete.
- Do not replace implementation with a description of
  what should be implemented.

## 5. Completion criteria
A task is complete only when its requested changes are
present in the workspace and the relevant verification
has succeeded. If verification is impossible, mark it
as unverified rather than complete.
