// import { AbstractEvent } from "../Events/AbstractEvent";

import { AbstractEvent } from "../Events";
import { DraggableInit } from "../Events/DragEvents";

export interface BaseEmitterEvents {
  "drag:start": DraggableInit;
  "drag:move": DraggableInit;
  "drag:end": DraggableInit;
}

/**
 * The Emitter is a simple emitter class that provides you with `on()`, `off()` and `trigger()` methods
 * @class Emitter
 * @module Emitter
 */
export class Emitter<Events extends BaseEmitterEvents = BaseEmitterEvents> {
  private callbacks: {
    [index in keyof Events]?: Map<(event: any) => void, number>;
  };

  constructor() {
    this.callbacks = {};
  }

  get events() {
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
  off(type: keyof Events, callback: () => void) {
    const callbacks = this.callbacks[type];
    if (!callbacks) {
      return null;
    }

    callbacks.delete(callback);

    return this;
  }

  /**
   * Triggers event callbacks by event object
   * @param {AbstractEvent} event
   */
  async trigger(event: AbstractEvent) {
    event = event as any;
    const type = event.type as keyof Events;
    const callbackMap = this.callbacks[type];
    if (!callbackMap) {
      return null;
    }

    const caughtErrors = [];

    const sortedCallbacks = Array.from(callbackMap.keys()).sort(
      (a, b) => (callbackMap.get(a) || 0) - (callbackMap.get(b) || 0)
    );

    for (const cb of sortedCallbacks) {
      try {
        await cb(event);
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
