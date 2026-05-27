export type CommandBuilder = {
  (...commands: string[]): string;
  with(command: string): CommandBuilder;
};

export type ArgsBuilder = {
  (...args: string[]): string[];
  with(...args: string[]): ArgsBuilder;
};

export type VpRunOptions = {
  args?: string[];
  cache?: boolean;
  concurrencyLimit?: number;
  filter?: string | string[];
  lastDetails?: boolean;
  noCache?: boolean;
  parallel?: boolean;
  recursive?: boolean;
  root?: boolean;
  transitive?: boolean;
  verbose?: boolean;
};

export function createCommand(base: string, prevCommand = ''): CommandBuilder {
  const current = prevCommand.trim();

  const builder = ((...commands: string[]) => {
    return [base.trim(), current, ...commands.map(command => command.trim())]
      .filter(Boolean)
      .join(' ');
  }) as CommandBuilder;

  builder.with = (command: string) => {
    return createCommand(base, [current, command.trim()].filter(Boolean).join(' '));
  };

  return builder;
}

export function createArgs(...baseArgs: string[]): ArgsBuilder {
  const current = baseArgs.map(arg => arg.trim()).filter(Boolean);

  const builder = ((...args: string[]) => {
    return [...current, ...args.map(arg => arg.trim()).filter(Boolean)];
  }) as ArgsBuilder;

  builder.with = (...args: string[]) => {
    return createArgs(...current, ...args);
  };

  return builder;
}

export function vpRun(task = '', options: VpRunOptions = {}): string {
  const filters = Array.isArray(options.filter)
    ? options.filter
    : options.filter
      ? [options.filter]
      : [];

  return [
    'vp run',
    options.cache ? '--cache' : '',
    options.noCache ? '--no-cache' : '',
    options.recursive ? '-r' : '',
    options.transitive ? '-t' : '',
    options.root ? '-w' : '',
    options.verbose ? '-v' : '',
    options.lastDetails ? '--last-details' : '',
    options.parallel ? '--parallel' : '',
    options.concurrencyLimit ? `--concurrency-limit ${options.concurrencyLimit}` : '',
    ...filters.flatMap(filter => ['--filter', filter.trim()]),
    task.trim(),
    ...(options.args ?? []).map(arg => arg.trim()),
  ]
    .filter(Boolean)
    .join(' ');
}

export {
  isTypeCheckEnabled,
  parseCheckArgs,
  resolveCheckCommands,
  resolveTypecheckRunner,
  shouldDelegateToVpCheck,
} from './check.ts';
export { loadVppConfig } from './config.ts';
export { resolveTestFramework } from './test.ts';
export type {
  BuiltinTypecheckRunner,
  BuiltinTestFramework,
  CommandRunner,
  TestFrameworkRunner,
  VppCommandConfig,
  VppCommandRunner,
  VppCliCallOptions,
  VppCliRunOptions,
  VppCliRunner,
  VppConfig,
  VppTestConfig,
  VppTypecheckConfig,
  VppUserConfig,
} from './types.ts';
