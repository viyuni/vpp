import { expect, test } from 'vite-plus/test';

import { call } from '../src/cli.ts';
import { createArgs, createCommand, vpRun } from '../src/index.ts';
import { resolveTestFramework } from '../src/test.ts';

test('uses vite-plus/test by default', () => {
  expect(resolveTestFramework()).toEqual({
    command: 'vp',
    args: ['test'],
  });
});

test('command builder composes shell command fragments', () => {
  const vp = createCommand('vp');

  expect(vp(' pack ')).toBe('vp pack');
  expect(vp.with('pm').with('publish')('--access public')).toBe('vp pm publish --access public');
});

test('command builder skips empty fragments', () => {
  const vp = createCommand(' vp ').with(' ').with('run');

  expect(vp('', ' build ')).toBe('vp run build');
});

test('args builder composes argv fragments', () => {
  const testArgs = createArgs('test').with('tests/foo.test.ts');

  expect(testArgs('-t', ' case name ')).toEqual(['test', 'tests/foo.test.ts', '-t', 'case name']);
});

test('args builder skips empty fragments', () => {
  const args = createArgs(' test ', '').with(' ', '--run');

  expect(args('', ' tests/foo.test.ts ')).toEqual(['test', '--run', 'tests/foo.test.ts']);
});

test('vpRun builds vite-plus task commands', () => {
  expect(vpRun('build')).toBe('vp run build');
  expect(vpRun('test', { args: ['--reporter verbose'] })).toBe('vp run test --reporter verbose');
});

test('vpRun trims tasks, args, and filters', () => {
  expect(
    vpRun(' test ', {
      args: [' --run ', ' '],
      filter: ' @my/app ',
    }),
  ).toBe('vp run --filter @my/app test --run');
});

test('vpRun builds workspace task commands', () => {
  expect(
    vpRun('dev', {
      concurrencyLimit: 4,
      filter: ['@my/app', '!@my/utils'],
      parallel: true,
      recursive: true,
    }),
  ).toBe('vp run -r --parallel --concurrency-limit 4 --filter @my/app --filter !@my/utils dev');
});

test('vpRun builds cache and target selection commands', () => {
  expect(
    vpRun('@my/app#build', {
      cache: true,
      transitive: true,
      verbose: true,
    }),
  ).toBe('vp run --cache -t -v @my/app#build');

  expect(
    vpRun('build', {
      noCache: true,
      root: true,
    }),
  ).toBe('vp run --no-cache -w build');
});

test('vpRun builds task summary commands without a task name', () => {
  expect(vpRun('', { lastDetails: true })).toBe('vp run --last-details');
});

test('cli call runs the resolved framework command', async () => {
  const calls: unknown[] = [];
  const code = await call({
    argv: ['test'],
    cwd: '.',
    run: async (command, args, options) => {
      calls.push([command, args, options.cwd]);

      return 0;
    },
  });

  expect(code).toBe(0);
  expect(calls).toEqual([['vp', ['test'], '.']]);
});

test('cli call forwards arguments to test command', async () => {
  const calls: unknown[] = [];
  const code = await call({
    argv: ['test', 'tests/foo.test.ts', '-t', 'case name'],
    cwd: '.',
    run: async (command, args, options) => {
      calls.push([command, args, options.cwd]);

      return 0;
    },
  });

  expect(code).toBe(0);
  expect(calls).toEqual([['vp', ['test', 'tests/foo.test.ts', '-t', 'case name'], '.']]);
});

test('cli call requires the test command', async () => {
  const calls: unknown[] = [];
  const code = await call({
    argv: [],
    cwd: '.',
    run: async command => {
      calls.push(command);

      return 0;
    },
  });

  expect(code).toBe(1);
  expect(calls).toEqual([]);
});

test('resolves a builtin framework from vpp config', () => {
  expect(resolveTestFramework('bun:test')).toEqual({
    command: 'bun',
    args: ['test'],
  });
});

test('places forwarded arguments after bun test command', () => {
  expect(resolveTestFramework('bun:test', ['--bun'])).toEqual({
    command: 'bun',
    args: ['test', '--bun'],
  });
});

test('appends forwarded arguments after vite-plus test command', () => {
  expect(resolveTestFramework('vite-plus/test', ['--run'])).toEqual({
    command: 'vp',
    args: ['test', '--run'],
  });
});

test('resolves vitest framework', () => {
  expect(resolveTestFramework('vitest')).toEqual({
    command: 'vitest',
    args: [],
  });
});

test('resolves test object config with env', () => {
  expect(
    resolveTestFramework(
      {
        name: 'vitest',
        env: {
          NODE_ENV: 'test',
        },
      },
      ['--run'],
    ),
  ).toEqual({
    command: 'vitest',
    args: ['--run'],
    env: {
      NODE_ENV: 'test',
    },
  });
});
