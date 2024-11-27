import fs from 'fs';
import { Log } from '../log/log';

export type StorageRequestPacket = {
  key: string;
  value: any;
};

export type StorageSavePacket = {
  key: string;
  value: any;
};

export type StorageResponsePacket = {
  key: string;
  value: any;
};

export class SourlyStorage {
  private storage: Record<string, any>;

  private static instance: SourlyStorage;

  private static readonly filename = `storage${process.env.NODE_ENV === 'development' ? '.dev' : ''}.json`;

  private constructor() {
    this.storage = {};
    this.load();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SourlyStorage();
    }
    return this.instance;
  }

  setItem(key: string, value: any) {
    this.storage[key] = value;
  }

  getItem(key: string) {
    return this.storage[key];
  }

  save() {
    // check operating system
    const os = process.platform;
    let path = '';
    if (os == 'win32') {
      path = `${process.env.APPDATA}/sourly`;
    } else {
      path = `${process.env.HOME}/.sourly`;
    }
    if (!fs.existsSync(path)) {
      Log.log('Storage::save', 0, `Creating directory ${path}`);
      fs.mkdirSync(path);
    }
    fs.writeFileSync(
      `${path}/${SourlyStorage.filename}`,
      JSON.stringify(this.storage),
    );
    Log.log('Storage::save', 0, `Saved storage to ${path}/storage.json`);
  }

  load() {
    const os = process.platform;
    let path = '';
    if (os == 'win32') {
      path = `${process.env.APPDATA}/sourly/${SourlyStorage.filename}`;
    } else {
      path = `${process.env.HOME}/.sourly/${SourlyStorage.filename}`;
    }
    if (fs.existsSync(path)) {
      this.storage = JSON.parse(fs.readFileSync(path).toString());
      Log.log('Storage::load', 0, `Loaded storage from ${path}`);
    }
  }
}
