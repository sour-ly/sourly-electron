import { Eventful } from "../../event/events";
import { Log } from "../../log/log";
import { RemoveNANFromObject } from "../input/filter";
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

type SettingsObjectEventMap = {
  'onUpdate': Settings;
}

class SettingsObject extends Eventful<SettingsObjectEventMap> implements Settings {
  notification: {
    enabled: boolean
    duration: number;
  }
  theme: 'light' | 'dark';

  constructor(props: Omit<Settings, 'save'> = sDefault) {
    super();
    this.notification = props.notification;
    this.theme = props.theme;
  }

  public set<T extends keyof SettingsObject>(key: T, value: OmittableSettings[T]) {
    if (key === 'Id') return;
    const k = key as keyof Omit<SettingsObject, 'Id'>;
    if (this[k] === undefined) return;
    if (typeof this[k] === 'number') {
      if (isNaN(value as any)) return;
    }
    this[k] = value as any;
    this.save();
  }

  public setAll(props: OmittableSettings) {
    const props_mutated = RemoveNANFromObject(props);
    Object.keys(props_mutated).forEach(key => {
      const k = key as keyof Omit<SettingsObject, 'Id'>;
      if (k as any === 'listeners') return;
      if (this[k] === undefined) return;
      if (key === 'Id') return;
      this[k] = props_mutated[key as keyof Settings];
    });

    this.save();
  }

  public save() {
    this.emit('onUpdate', this);
    IPC.sendMessage('storage-save', { key: 'settings', value: this.toJSON() });
    Log.log('settings:save', 0, 'saved settings to storage', this.toJSON());
  }

  public toJSON(): OmittableSettings {
    return {
      notification: this.notification,
      theme: this.theme
    }
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
