export type BuiltinTestFramework = 'bun:test' | 'vitest' | 'vp';

export type VppCommandConfig = {
  /**
   * The executable command to run.
   */
  command: string;
  /**
   * Arguments passed to the executable command.
   */
  args?: string[];
  /**
   * Environment values merged into the spawned process.
   */
  env?: Record<string, string>;
};

export type VppCommandRunner = VppCommandConfig;

export type CommandRunner = VppCommandRunner;

export type TestFrameworkRunner = VppCommandRunner;

export type BuiltinTypecheckRunner = 'nuxt' | 'tsc' | 'vp';

export type VppTypecheckConfig = BuiltinTypecheckRunner | VppCommandConfig;

export interface VppCliRunOptions {
  cwd: string;
  env?: NodeJS.ProcessEnv;
}

export type VppCliRunner = (
  command: string,
  args: string[],
  options: VppCliRunOptions,
) => Promise<number>;

export interface VppCliCallOptions {
  argv?: string[];
  cwd?: string;
  run?: VppCliRunner;
}

export type VppTestConfig =
  | BuiltinTestFramework
  | ({
      name: BuiltinTestFramework;
    } & Pick<VppCommandConfig, 'env'>);

export interface VppConfig {
  /**
   * Selects which test framework vpp should load.
   *
   * `vp` keeps Vite+'s bundled test runner, `vitest` runs a project-provided
   * Vitest binary, and `bun:test` runs Bun's test command.
   */
  test?: VppTestConfig;
  /**
   * Selects the type-check runner used by `vpp check` when
   * `lint.options.typeCheck` is enabled.
   *
   * When unset, `vpp check` delegates directly to `vp check`.
   */
  typecheck?: VppTypecheckConfig;
}

export type VppUserConfig = {
  vpp?: VppConfig;
};

//@ts-ignore
declare module 'vite-plus' {
  interface UserConfig {
    /**
     * vpp extensions for vite-plus.
     */
    vpp?: VppConfig;
  }
}
