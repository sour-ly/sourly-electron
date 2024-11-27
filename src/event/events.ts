import Identifiable from '../id/id';

type EventMap<U> = {
  onUpdates: U;
};

export type Event<T extends any, U extends any> = {
  [key in keyof T]: U;
} & EventMap<U>;

type Listener<T> = (args: T) => Promise<void> | void;

export abstract class Eventful<T extends Event<any, any>> extends Identifiable {
  protected listeners: Map<keyof T, Listener<T[keyof T]>[]> = new Map();

  protected constructor() {
    super();
  }

  on<K extends keyof T>(event: K, listener: Listener<T[K]>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    // @ts-ignore
    const i = this.listeners.get(event)!.push(listener);
    return i - 1;
  }

  off<K extends keyof T>(event: K, idx: number) {
    if (!this.listeners.has(event)) {
      return;
    }
    const arr = this.listeners.get(event)!;
    const new_arr = arr.filter((_, i) => i !== idx);

    this.listeners.set(event, new_arr);
  }

  once<K extends keyof T>(event: K, listener: Listener<T[K]>) {
    const idx = this.on(event, async (args) => {
      await listener(args);
      this.off(event, idx);
    });
  }

  protected async emit<K extends keyof T>(
    event: K,
    args: T[K],
    callback?: () => void,
  ) {
    if (!this.listeners.has(event)) {
      return;
    }

    for (const listener of this.listeners.get(event)!) {
      await listener(args);
    }
    if (callback) {
      // this is a hack to ensure that the callback is called after all listeners have been called
      callback();
    }
  }
}
