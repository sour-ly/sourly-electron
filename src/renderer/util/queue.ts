import { Eventful } from "../../event/events";
import { Log } from "../../log/log";

type QueueEventMap<T> = {
  'queue': T;
  'queueintoempty': T;
  'pop': T;
}

class Queue<T extends { localeCompare: (a: T) => number }> extends Eventful<QueueEventMap<T>> {

  public data: T[] = [];

  constructor() {
    super();
    this.data = [];
  }

  queue(message: T) {
    let i = 0;
    Log.log('queue', 0, 'queueing message', message);
    for (; i < this.data.length; i++) {
      if (message.localeCompare(this.data[i]) < 0) {
        break;
      }
    }
    this.data.splice(i, 0, message);
    if (this.data.length === 1) {
      this.emit('queueintoempty', message);
    } else {
      this.emit('queue', message);
    }
  };

  pop() {
    return this.data.shift();
  }

  get length() {
    return this.data.length;
  }

  get empty() {
    return this.data.length === 0;
  }

  get poll() {
    return this.data[0];
  }
}

export default Queue;
