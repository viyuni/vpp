import arg from 'arg';

import { loadVitePlusConfig } from './config.ts';
import type { LoadedVitePlusConfig } from './config.ts';
import type {
  BuiltinTypecheckRunner,
  CommandRunner,
  VppCliCallOptions,
  VppTypecheckConfig,
  VppUserConfig,
} from './types.ts';

type CheckArgs = {
  fix: boolean;
  noFmt: boolean;
  noLint: boolean;
};

type CheckCommand = readonly [command: string, args: string[], env?: Record<string, string>];

const builtinTypecheckRunners = {
  nuxt: () => ({
    command: 'vp',
    args: ['exec', 'nuxt', 'typecheck'],
  }),
  tsc: () => ({
    command: 'vp',
    args: ['exec', 'tsc', '--noEmit'],
  }),
  vp: () => ({
    command: 'vp',
    args: ['check'],
  }),
} satisfies Record<BuiltinTypecheckRunner, () => CommandRunner>;

export async function callCheck(options: VppCliCallOptions): Promise<number> {
  const cwd = options.cwd ?? process.cwd();
  const argv = options.argv ?? [];
  const config = await loadVitePlusConfig(cwd);

  if (!options.run) {
    throw new Error('Missing command runner.');
  }

  if (shouldDelegateToVpCheck(config)) {
    return options.run('vp', ['check', ...argv], {
      cwd,
      env: process.env,
    });
  }

  const checkArgs = parseCheckArgs(argv);
  const typeCheckEnabled = isTypeCheckEnabled(config);

  if (checkArgs.noFmt && checkArgs.noLint && !typeCheckEnabled) {
    console.error('No checks selected. Enable lint.options.typeCheck to run type-check only.');

    return 1;
  }

  const typecheckRunner = typeCheckEnabled ? resolveTypecheckRunner(config.vpp?.typecheck) : null;
  const commands = resolveCheckCommands(checkArgs, typecheckRunner);

  for (const [command, args, env] of commands) {
    const code = await options.run(command, args, {
      cwd,
      env: {
        ...process.env,
        ...env,
      },
    });

    if (code !== 0) {
      return code;
    }
  }

  return 0;
}

export function resolveCheckCommands(
  checkArgs: CheckArgs,
  typecheckRunner: CommandRunner | null,
): CheckCommand[] {
  const commands: CheckCommand[] = [];

  if (!checkArgs.noFmt) {
    commands.push(['vp', ['fmt', ...(checkArgs.fix ? [] : ['--check'])]]);
  }

  if (!checkArgs.noLint) {
    commands.push(['vp', ['lint', ...(checkArgs.fix ? ['--fix'] : [])]]);
  }

  if (typecheckRunner) {
    commands.push([typecheckRunner.command, typecheckRunner.args ?? [], typecheckRunner.env]);
  }

  return commands;
}

export function shouldDelegateToVpCheck(config: VppUserConfig): boolean {
  const typecheck = config.vpp?.typecheck;

  return !typecheck || typecheck === 'vp';
}

export function isTypeCheckEnabled(config: LoadedVitePlusConfig): boolean {
  return config.lint?.options?.typeCheck === true;
}

export function resolveTypecheckRunner(typecheckConfig?: VppTypecheckConfig): CommandRunner {
  if (typeof typecheckConfig === 'object') {
    return typecheckConfig;
  }

  if (typecheckConfig) {
    return resolveBuiltinTypecheckRunner(typecheckConfig);
  }

  return resolveBuiltinTypecheckRunner('vp');
}

function resolveBuiltinTypecheckRunner(name: BuiltinTypecheckRunner): CommandRunner {
  return builtinTypecheckRunners[name]();
}

export function parseCheckArgs(argv: string[]): CheckArgs {
  const parsed = arg(
    {
      '--fix': Boolean,
      '--no-fmt': Boolean,
      '--no-lint': Boolean,
    },
    {
      argv,
    },
  );

  return {
    fix: parsed['--fix'] ?? false,
    noFmt: parsed['--no-fmt'] ?? false,
    noLint: parsed['--no-lint'] ?? false,
  };
}
