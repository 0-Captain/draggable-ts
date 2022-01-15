import { AbstractEvent } from "../../Events";

interface SensorEventProps {
  originalEvent: Event;
  source?: Element;
  target?: Element | null;
  pageX: number;
  pageY: number;
  clientX: number;
  clientY: number;
}

export class SensorEvent extends AbstractEvent {
  static type = "sensor:event";

  constructor(private options: SensorEventProps) {
    super({
      originalEvent: options.originalEvent,
      source: options.source || (options.originalEvent.target as Element),
    });
  }

  get target() {
    return this.options.target || this.originalEvent.target;
  }

  get pageX() {
    return this.options.pageX;
  }

  get pageY() {
    return this.options.pageY;
  }

  get clientX() {
    return this.options.clientX;
  }

  get clientY() {
    return this.options.clientY;
  }
}

export class DragStartSensorEvent extends SensorEvent {
  static type = "drag:start";
}

export class DragMoveSensorEvent extends SensorEvent {
  static type = "drag:move";
}

export class DragStopSensorEvent extends SensorEvent {
  static type = "drag:stop";
}
