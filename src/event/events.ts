import Identifiable from '../id/id';



export type Absorbable<T = any> = {
  absorb: () => void;
  optimisticValue?: T;
};


export type Event<T extends any, U extends any> = {
  [key in keyof T]: U & Absorbable;
};

// z acts as a return type
export type Listener<T, Z = void> = (args: T) => Promise<Z> | Z;


/* PROBLEM: How do we implement the event system in a way that handles absorbing events and making sure things aren't passed before they're absorbed?
 * SOLUTION?: maybe we should have a queue of normal events and a queue of absorbed events; this means that events that are not really data dependent but are more like signals can be absorbed. However, things that are data dependent such as a goal being completed should not be executed before any of the absorbed events
 * We shouldn't require the developer to implement the same redundant logic for every event that can be absorbed, this will lead to alot of bugs down the road.
 */

/* HOW TO USE:
 * Define a event as normal wherever, and then somewhere else listen for the event and do something with it; if you want to have the ability to cancel (absorb) the event before it is emitted (and subsequently the more data dependent listeners) then you should use the absorbableOn method to listen for the event
 */

export abstract class Eventful<T extends Event<any, any>> extends Identifiable {
  //these two data structures should be the same exact thing, but the absorbed listeners are called before the callback and the normal listeners are called after the callback, normal listeners are never called if the absorbed listeners return false
  protected readonly listeners: Map<keyof T, Listener<T[keyof T]>[]> = new Map([]);
  protected readonly absorbListeners: Map<keyof T, Listener<T[keyof T], boolean>[]> = new Map([]);

  protected constructor() {
    super();

  }

  /* Absorbable events are events that are data dependent, they should be absorbed before they are emitted */
  absorbableOn<K extends keyof T>(event: K, listener: Listener<T[K], boolean>) {
    if (!this.absorbListeners.has(event)) {
      this.absorbListeners.set(event, []);
    }
    // @ts-ignore
    const i = this.absorbListeners.get(event)!.push(listener);
    return i - 1;
  }

  //delete absorbable event listener
  absorbOff<K extends keyof T>(event: K, idx: number) {
    if (!this.absorbListeners.has(event)) {
      return;
    }
    const arr = this.absorbListeners.get(event)!;
    const new_arr = arr.filter((_, i) => i !== idx);

    this.absorbListeners.set(event, new_arr);
  }
  /* END OF ABSORBABLE EVENTS */

  //this should remain normal, this should act as the data dependent events
  on<K extends keyof T>(event: K, listener: Listener<T[K]>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    // @ts-ignore
    const i = this.listeners.get(event)!.push(listener);
    return i - 1;
  }

  //delete normal event listener
  off<K extends keyof T>(event: K, idx: number) {
    if (!this.listeners.has(event)) {
      return;
    }
    const arr = this.listeners.get(event)!;
    const new_arr = arr.filter((_, i) => i !== idx);

    this.listeners.set(event, new_arr);
  }

  //this is a one time event listener, it will only be called once and then removed
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
    //lets do some async stuff here

    //absorb all the events that are data dependent
    if (this.absorbableHasEvent(event)) {
      for (const listener of this.absorbListeners.get(event)!) {
        const absorbed = await listener(args);
        if (absorbed) {
          return;
        }
      }
    }

    //make sure this is ran before the callback is ran, events that make use of the callback property will only be effected by this; if the event handler already executes logic, all this will do is cancel the callback
    if (callback) {
      callback();
    }

    if (!this.listeners.has(event)) {
      return;
    }
    for (const listener of this.listeners.get(event)!) {
      await listener(args);
    }
  }

  /* Typesafe Wrapper Functions */

  protected absorbableHasEvent<K extends keyof T>(event: K): boolean {
    //check if the map is just empty
    if (this.absorbListeners?.size === 0) {
      return false;
    }

    if (this.absorbListeners?.has(event)) {
      return true;
    } else {
      return false;
    }

  }

  // just a wrapper function to get the event
  protected getAbsorbableEvent<K extends keyof T>(event: K): T[K] {
    if (this.absorbableHasEvent(event)) {
      this.absorbListeners.set(event, []);
    }
    return this.absorbListeners.get(event)! as T[K];
  }

}
