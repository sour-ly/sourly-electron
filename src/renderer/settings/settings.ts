export interface Settings {
  notification: {
    enabled: boolean;
    duration: number;
  }
  theme: 'light' | 'dark';
}

export const sDefault: Settings = {
  notification: {
    enabled: true,
    duration: 5
  },
  theme: 'light'
}
