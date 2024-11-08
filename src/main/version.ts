export type EnvironmentVariables = {
  version: string;
  mode: 'development' | 'production';
  debug: boolean;
  platform: NodeJS.Platform;
}

type Version = `${number}.${number}.${number}`;

export const version: Version = "0.0.7";
