import { Eventful } from "../../event/events";
import { Log } from "../../log/log";

type QueueEventMap<T> = {
  'queue': T;
  'queueintoempty': T;
  'pop': T;
  'update': Queue<any>;
}

class Queue<T extends { localeCompare: (a: T) => number }> extends Eventful<QueueEventMap<T>> {

  public data: T[] = [];

  constructor() {
    super();
    this.data = [];
    this.on('queue', () => this.emit('update', this));
    this.on('queueintoempty', () => this.emit('update', this));
    this.on('pop', () => this.emit('update', this));
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
    const data = this.data.shift();
    if (data)
      this.emit('pop', data);
    return data;
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
