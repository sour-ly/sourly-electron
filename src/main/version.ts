export type EnvironmentVariables = {
  version: string;
  mode: 'development' | 'production';
  debug: boolean;
  platform: NodeJS.Platform;
}

export const version = "0.0.5";
