#!/usr/bin/env node

import { spawn } from 'node:child_process';

import arg from 'arg';

import { callCheck } from './check.ts';
import { callTest } from './test.ts';
import type { VppCliCallOptions, VppCliRunOptions } from './types.ts';

export async function call(options: VppCliCallOptions = {}): Promise<number> {
  const args = parseArgs(options.argv ?? process.argv.slice(2));
  const run = options.run ?? runCommand;

  if (args.command === 'check') {
    return callCheck({
      ...options,
      argv: args.forwarded,
      run,
    });
  }

  if (args.command === 'test') {
    return callTest({
      ...options,
      argv: args.forwarded,
      run,
    });
  }

  printHelp(args.command);

  return 1;
}

function printHelp(command?: string): void {
  if (command) {
    console.log(`Unknown command: ${command}`);
    console.log('');
  }

  console.log('Usage: vpp <command> [args...]');
  console.log('');
  console.log('Commands:');
  console.log('  check   Run format, lint, and type checks');
  console.log('  test    Run the configured test framework');
  console.log('');
  console.log('Examples:');
  console.log('  vpp check');
  console.log('  vpp check --fix');
  console.log('  vpp test');
  console.log('  vpp test tests/foo.test.ts -t "case name"');
}

function parseArgs(argv: string[]): { command?: string; forwarded: string[] } {
  const parsed = arg(
    {},
    {
      argv,
      permissive: true,
    },
  );

  return {
    command: parsed._[0],
    forwarded: parsed._.slice(1),
  };
}

function runCommand(command: string, args: string[], options: VppCliRunOptions): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', code => resolve(code ?? 1));
  });
}

call()
  .then(code => {
    process.exitCode = code;
  })
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
