import { Eventful } from "../../event/events";
import { Log } from "../../log/log";

type QueueEventMap<T> = {
  'queue': T;
  'queueintoempty': T;
  'pop': T;
  'update': Queue<any>;
}

class Queue<T> extends Eventful<QueueEventMap<T>> {

  public data: T[] = [];

  constructor() {
    super();
    this.data = [];
    this.on('queue', () => this.emit('update', this));
    this.on('queueintoempty', () => this.emit('update', this));
    this.on('pop', () => this.emit('update', this));
  }

  queue(message: T) {
    Log.log('queue', 0, 'queueing message', message);
    //place the message in the queue
    this.data.push(message);
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
