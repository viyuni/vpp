import { defu } from 'defu';
import { loadConfig } from 'unconfig';
import type { LoadConfigSource } from 'unconfig';

import type { VppConfig, VppUserConfig } from './types.ts';

export type {
  BuiltinTestFramework,
  TestFrameworkRunner,
  VppCliCallOptions,
  VppCliRunOptions,
  VppCliRunner,
  VppConfig,
  VppTestConfig,
  VppUserConfig,
} from './types.ts';

const defaultVppConfig = {
  test: 'vite-plus/test',
} satisfies VppConfig;

const configSources = [
  {
    files: 'vite.config',
    rewrite: config => (config as VppUserConfig).vpp,
  },
] satisfies LoadConfigSource<VppConfig>[];

export async function loadVppConfig(cwd = process.cwd()): Promise<VppConfig> {
  const result = await loadConfig.async<VppConfig>({
    cwd,
    sources: configSources,
    defaults: {},
  });

  return defu(result.config, defaultVppConfig);
}
