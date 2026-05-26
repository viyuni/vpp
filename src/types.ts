export type BuiltinTestFramework = 'bun:test' | 'vite-plus/test' | 'vitest';

export type TestFrameworkRunner = {
  /**
   * The executable command used by the selected test framework.
   */
  command: string;
  /**
   * Arguments passed to the executable command.
   */
  args?: string[];
  /**
   * Environment values merged into the spawned test process.
   */
  env?: Record<string, string>;
};

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
  | {
      name: BuiltinTestFramework;
      env?: Record<string, string>;
    };

export interface VppConfig {
  /**
   * Selects which test framework vpp should load.
   *
   * `vite-plus/test` keeps Vite+'s bundled Vitest runner, `vitest` runs a
   * project-provided Vitest binary, and `bun:test` runs Bun's test command.
   */
  test?: VppTestConfig;
}

export type VppUserConfig = {
  vpp?: VppConfig;
};

//@ts-ignore
declare module 'vite' {
  interface UserConfig {
    /**
     * vpp extensions for vite-plus.
     */
    vpp?: VppConfig;
  }
}

//@ts-ignore
declare module 'vite-plus' {
  interface UserConfig {
    /**
     * vpp extensions for vite-plus.
     */
    vpp?: VppConfig;
  }
}
