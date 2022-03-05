import { SensorEvent } from "@sensors/SensorEvents";
import { AbstractEvent } from "./AbstractEvent";

export interface DragEventProps {
  source: HTMLElement;
  target: HTMLElement | null;
  originalEvent: Event;
  sensorEvent: SensorEvent;
  over: HTMLElement | null;
}
export class DragEvent extends AbstractEvent {
  static type = "drag";

  constructor(private options: DragEventProps) {
    super({
      source: options.source,
      originalEvent: options.originalEvent,
    });
  }

  get source() {
    return this.options.source;
  }

  get target() {
    return this.options.target;
  }

  get over() {
    return this.options.over || null;
  }

  get sensorEvent() {
    return this.options.sensorEvent;
  }
}

export class DragStartEvent extends DragEvent {
  static type = "drag:start";

  private _cancel = false;

  get canceled() {
    return this._cancel;
  }

  cancel() {
    this._cancel = true;
  }
}

export class DragMoveEvent extends DragEvent {
  static type = "drag:move";
}

export class DragEndEvent extends DragEvent {
  static type = "drag:end";
}

export class DragOverEvent extends DragEvent {
  static type = "drag:over";
}
