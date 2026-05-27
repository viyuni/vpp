import { defu } from 'defu';
import { loadConfig } from 'unconfig';
import type { LoadConfigSource } from 'unconfig';

import type { VppConfig, VppUserConfig } from './types.ts';

type VitePlusLintConfig = {
  options?: {
    typeCheck?: boolean;
  };
};

export type LoadedVitePlusConfig = VppUserConfig & {
  lint?: VitePlusLintConfig;
};

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
  test: 'vp',
  typecheck: 'vp',
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

export async function loadVitePlusConfig(cwd = process.cwd()): Promise<LoadedVitePlusConfig> {
  const result = await loadConfig.async<LoadedVitePlusConfig>({
    cwd,
    sources: [
      {
        files: 'vite.config',
      },
    ],
    defaults: {},
  });

  return result.config ?? {};
}
