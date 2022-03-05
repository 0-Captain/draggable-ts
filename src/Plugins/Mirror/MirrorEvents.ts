import { SensorEvent } from "@sensors/SensorEvents";
import { AbstractEvent, AbstractEventProps } from "src/Events";
import { DragEvent } from "src/Events/DragEvents";
import { MirrorOptions } from ".";

export interface MirrorEventProps extends AbstractEventProps {
  sensorEvent: SensorEvent;
  dragEvent: DragEvent;
  originalEvent: Event;
  mirror: HTMLElement | null;
  options: MirrorOptions;
  passedThreshX?: boolean;
  passedThreshY?: boolean;
}

export class MirrorEvent extends AbstractEvent {
  constructor(public options: MirrorEventProps) {
    super(options);
  }

  /** Sensor event */
  get source() {
    return this._source as HTMLElement;
  }

  /** Sensor event */
  get sensorEvent() {
    return this.options.sensorEvent;
  }

  /** Drag event */
  get dragEvent() {
    return this.options.dragEvent;
  }

  /** Original event that triggered sensor event */
  get originalEvent() {
    return this.options.originalEvent;
  }

  /** Draggables mirror element*/
  get mirror() {
    return this.options.mirror;
  }
}

/** Mirror create event */
export class MirrorCreateEvent extends MirrorEvent {
  static type = "mirror:create";
}

/** Mirror attached event */
export class MirrorAttachedEvent extends MirrorEvent {
  static type = "mirror:attached";
}

/** Mirror move event */
export class MirrorMoveEvent extends MirrorEvent {
  static type = "mirror:move";
  static cancelable = true;

  /** 是否超过了x轴的阈值 */
  get passedThreshX() {
    return this.options.passedThreshX || false;
  }

  /** 是否超过了y轴的阈值 */
  get passedThreshY() {
    return this.options.passedThreshY || false;
  }
}

/**
 * Mirror destroy event
 * @class MirrorDestroyEvent
 * @module MirrorDestroyEvent
 * @extends MirrorEvent
 */
export class MirrorDestroyEvent extends MirrorEvent {
  static type = "mirror:destroy";
  static cancelable = true;
}
