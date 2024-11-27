export type EnvironmentVariables = {
  version: string;
  mode: 'development' | 'production';
  debug: boolean;
  platform: NodeJS.Platform;
};

type Version = `${number}.${number}.${number}`;

export const version: Version = '0.1.0';

export const endpoint = 'http://localhost:3000/api/v1/';
