import { AbstractEvent } from "../Events";

export interface AbstractEmitterEvents {
  readonly [index: string]: AbstractEvent;
  readonly [index: number]: never;
  readonly [index: symbol]: never;
}

type Valueof<T> = T[keyof T];

/**
 * The Emitter is a simple emitter class that provides you with `on()`, `off()` and `trigger()` methods
 * @class Emitter
 * @module Emitter
 */
export class Emitter<Events extends AbstractEmitterEvents> {
  private callbacks: {
    [index in keyof Events]?: Map<(event: Events[index]) => void, number>;
  };

  constructor() {
    this.callbacks = {};
  }

  get listeners() {
    return this.callbacks;
  }

  /**
   * Registers callbacks by event name
   * @param {String} type
   * @param {Function} callbacks
   * @param {Number} priority
   */
  on<EventTypes extends keyof Events>(
    type: EventTypes,
    callback: (e: Events[EventTypes]) => void,
    priority = 0
  ) {
    if (!this.callbacks[type]) {
      this.callbacks[type] = new Map();
    }

    this.callbacks[type]?.set(callback, priority);

    return this;
  }

  /**
   * Unregisters callbacks by event name
   * @param {String} type
   * @param {Function} callback
   */
  off<EventTypes extends keyof Events>(
    type: EventTypes,
    callback: (e: Events[EventTypes]) => void
  ) {
    const callbacks = this.callbacks[type];
    if (callbacks) {
      callbacks.delete(callback);
    }
    return this;
  }

  /**
   * Triggers event callbacks by event object
   * @param {AbstractEvent} event
   */
  async trigger(event: AbstractEvent) {
    const type = event.type as keyof Events;
    const callbackMap = this.callbacks[type];
    if (!callbackMap) {
      return null;
    }

    const caughtErrors = [];

    const sortedCallbacks = Array.from(callbackMap.keys()).sort(
      (a, b) => (callbackMap.get(b) || 0) - (callbackMap.get(a) || 0)
    );

    for (const cb of sortedCallbacks) {
      try {
        await cb(event as Valueof<Events>);
      } catch (error) {
        caughtErrors.push(error);
      }
    }
    if (caughtErrors.length) {
      console.error(
        `Draggable caught errors while triggering '${event.type}'`,
        caughtErrors
      );
    }

    return this;
  }
}
