import { loadVppConfig } from './config.ts';
import type {
  BuiltinTestFramework,
  TestFrameworkRunner,
  VppCliCallOptions,
  VppTestConfig,
} from './types.ts';

const builtinFrameworks = {
  'bun:test': (args: string[]) => ({
    command: 'bun',
    args: ['test', ...args],
  }),
  vp: (args: string[]) => ({
    command: 'vp',
    args: ['test', ...args],
  }),
  vitest: (args: string[]) => ({
    command: 'vitest',
    args,
  }),
} satisfies Record<BuiltinTestFramework, (args: string[]) => TestFrameworkRunner>;

export async function callTest(options: VppCliCallOptions): Promise<number> {
  const cwd = options.cwd ?? process.cwd();
  const config = await loadVppConfig(cwd);
  const framework = resolveTestFramework(config.test, options.argv);

  if (!options.run) {
    throw new Error('Missing command runner.');
  }

  return options.run(framework.command, framework.args ?? [], {
    cwd,
    env: {
      ...process.env,
      ...framework.env,
    },
  });
}

export function resolveTestFramework(
  testConfig: VppTestConfig = 'vp',
  args: string[] = [],
): TestFrameworkRunner {
  const framework = typeof testConfig === 'object' ? testConfig.name : (testConfig ?? 'vp');

  const runner = resolveBuiltinFramework(framework, args);

  if (typeof testConfig !== 'object' || !testConfig.env) {
    return runner;
  }

  return {
    ...runner,
    env: testConfig.env,
  };
}

function resolveBuiltinFramework(name: BuiltinTestFramework, args: string[]): TestFrameworkRunner {
  return builtinFrameworks[name](args);
}
