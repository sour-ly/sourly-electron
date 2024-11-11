import { Log } from "../../log/log";
import IPC from "../ReactIPC";

type StringfulObject = { [key: string]: any };

export interface Settings extends StringfulObject {
  notification: {
    enabled: boolean;
    duration: number;
  }
  theme: 'light' | 'dark';
  set: <T extends keyof SettingsObject>(key: T, value: OmittableSettings[T]) => void;
  setAll: (props: OmittableSettings) => void;
  save: () => void;
};

type OmittableSettings = Omit<Omit<Omit<Settings, 'save'>, 'set'>, 'setAll'>;

class SettingsObject implements Settings {
  notification: {
    enabled: boolean
    duration: number;
  }
  theme: 'light' | 'dark';

  constructor(props: Omit<Settings, 'save'> = sDefault) {
    this.notification = props.notification;
    this.theme = props.theme;
  }

  public set<T extends keyof SettingsObject>(key: T, value: OmittableSettings[T]) {
    this[key as keyof SettingsObject] = value as any;
    this.save();
  }

  public setAll(props: OmittableSettings) {
    Object.keys(props).forEach(key => {
      if (this[key as keyof SettingsObject] === undefined) return;
      this[key as keyof SettingsObject] = props[key as keyof Settings];
    });
    this.save();
  }

  public save() {
    IPC.sendMessage('storage-save', { key: 'settings', value: this });
    Log.log('settings:save', 0, 'saved settings to storage', this);
  }
}

export const sDefault: Omit<Settings, 'save'> = {
  notification: {
    enabled: true,
    duration: 5000
  },
  theme: 'light'
}

export default SettingsObject;
