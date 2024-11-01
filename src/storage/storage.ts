export class SourlyStorage {

  private storage: Record<string, any>;

  constructor() {
    this.storage = {};
  }

  setItem(key: string, value: any) {
    this.storage[key] = value;
  }

  getItem(key: string) {
    return this.storage[key];
  }

  save() {
    //check operating system

  }
}
