# Developer Notes

## Tests

Run the regression test with:

```bash
npm test
```

The `test` script is defined in `package.json` and executes:

```bash
node test/regression.js
```

## Git hooks

This repository stores hook scripts in `.githooks/` so they can be tracked in source control.

- `.githooks/pre-push` – Linux/macOS/Bash-compatible pre-push hook
- `.githooks/pre-push.cmd` – Windows-compatible pre-push hook

After cloning, run:

```bash
npm run install-hooks
```

That sets Git's hook directory to `.githooks` for the current repo.

Each hook runs `npm test` and aborts the push if the test command exits with an error.

> Note: Git hook files under `.githooks/` are tracked in the repository, but each clone still needs `npm run install-hooks` once to enable them.
