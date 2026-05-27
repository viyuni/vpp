# vpp

vpp is a small extension toolkit for Vite+. It adds a CLI layer that can load
project configuration and dispatch commands to different underlying tools.

The current focus is test runner selection. You run one command:

```bash
vpp test
```

vpp reads the `vpp` field from your Vite+ config, resolves the configured test
framework, and calls the matching test command.

## Supported Features

- `vpp test` command dispatch
- Config loading from `vite.config.ts` with `unconfig`
- Config merging with `defu`
- CLI argument parsing with `arg`
- Vite+ config type augmentation through `vpp`
- Command helpers for Vite+ tasks:
  - `createCommand`
  - `createArgs`
  - `vpRun`
- Test framework selection:
  - `vite-plus/test`
  - `vitest`
  - `bun:test`

## Command Helpers

`@viyuni/vpp` exports small helpers for composing Vite+ task commands in
`vite.config.ts`.

### `createCommand`

Use `createCommand` when you want to build reusable command prefixes:

```ts
import { createCommand } from '@viyuni/vpp';

const vp = createCommand('vp');
const publish = vp.with('pm').with('publish');

vp('pack');
// => 'vp pack'

publish('--access public');
// => 'vp pm publish --access public'
```

Empty fragments are ignored and command fragments are trimmed.

### `createArgs`

Use `createArgs` when you need an argv array instead of a shell command string:

```ts
import { createArgs } from '@viyuni/vpp';

const testArgs = createArgs('test').with('tests/foo.test.ts');

testArgs('-t', 'case name');
// => ['test', 'tests/foo.test.ts', '-t', 'case name']
```

### `vpRun`

Use `vpRun` to generate `vp run` commands for Vite+ tasks and workspace runs:

```ts
import { defineConfig } from 'vite-plus';
import { vpRun } from '@viyuni/vpp';

export default defineConfig({
  run: {
    tasks: {
      build: {
        command: vpRun('build'),
      },
      dev: {
        command: vpRun('dev', {
          filter: '@my/app',
          parallel: true,
          recursive: true,
        }),
        cache: false,
      },
      details: {
        command: vpRun('', {
          lastDetails: true,
        }),
      },
    },
  },
});
```

Examples:

```ts
vpRun('build');
// => 'vp run build'

vpRun('test', {
  args: ['--reporter verbose'],
});
// => 'vp run test --reporter verbose'

vpRun('dev', {
  concurrencyLimit: 4,
  filter: ['@my/app', '!@my/utils'],
  parallel: true,
  recursive: true,
});
// => 'vp run -r --parallel --concurrency-limit 4 --filter @my/app --filter !@my/utils dev'
```

## Configuration

Configure vpp in `vite.config.ts`. vpp is intended to live inside the Vite+
config because it extends Vite+ behavior:

```ts
import { defineConfig } from 'vite-plus';

export default defineConfig({
  vpp: {
    test: 'bun:test',
  },
});
```

You can also use object form when you need extra environment variables:

```ts
import { defineConfig } from 'vite-plus';

export default defineConfig({
  vpp: {
    test: {
      name: 'vitest',
      env: {
        NODE_ENV: 'test',
      },
    },
  },
});
```

If no test framework is configured, vpp defaults to:

```ts
{
  vpp: {
    test: 'vite-plus/test',
  },
}
```

That resolves to:

```bash
vp test
```

## Test Command Mapping

| vpp config       | Resolved command |
| ---------------- | ---------------- |
| `vite-plus/test` | `vp test`        |
| `vitest`         | `vitest`         |
| `bun:test`       | `bun test`       |

Arguments after `vpp test` are forwarded after the resolved test command:

```bash
vpp test tests/example.test.ts
```

For `bun:test`, this becomes:

```bash
bun test tests/example.test.ts
```

## AI Prompt

When this project already has `vpp` available, prefer it for test commands.

- Use `vpp test` instead of `vp test`.
- Use `vpp test <args...>` instead of `vp test <args...>`.
- Keep using existing Vite+ commands for non-test tasks, such as `vp check`,
  `vp pack`, and `vp run <script>`.
- Fall back to `vp test` only if `vpp` is not available.

## Local Development

Install dependencies:

```bash
vp install
```

Run tests:

```bash
vpp test
```

Run checks:

```bash
vp check
```

Build:

```bash
vp pack
```

Link locally as a global command:

```bash
pnpm link --global
```

Then run:

```bash
vpp test
```
