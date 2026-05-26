import { expect, test } from 'vite-plus/test';

import { call } from '../src/cli.ts';
import { resolveTestFramework } from '../src/test.ts';

test('uses vite-plus/test by default', () => {
  expect(resolveTestFramework()).toEqual({
    command: 'vp',
    args: ['test'],
  });
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
