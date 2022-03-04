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

  /**
   * Draggables source element
   * @property source
   * @type {HTMLElement}
   * @readonly
   */
  get source() {
    return this._source as HTMLElement;
  }

  /**
   * Sensor event
   * @property sensorEvent
   * @type {SensorEvent}
   * @readonly
   */
  get sensorEvent() {
    return this.options.sensorEvent;
  }

  /**
   * Drag event
   * @property dragEvent
   * @type {DragEvent}
   * @readonly
   */
  get dragEvent() {
    return this.options.dragEvent;
  }

  /**
   * Original event that triggered sensor event
   * @property originalEvent
   * @type {Event}
   * @readonly
   */
  get originalEvent() {
    return this.options.originalEvent;
  }

  /**
   * Draggables mirror element
   * @property mirror
   * @type {HTMLElement}
   * @readonly
   */
  get mirror() {
    return this.options.mirror;
  }
}

/**
 * Mirror create event
 * @class MirrorCreateEvent
 * @module MirrorCreateEvent
 * @extends MirrorEvent
 */
export class MirrorCreateEvent extends MirrorEvent {
  static type = "mirror:create";
}

/**
 * Mirror attached event
 * @class MirrorAttachedEvent
 * @module MirrorAttachedEvent
 * @extends MirrorEvent
 */
export class MirrorAttachedEvent extends MirrorEvent {
  static type = "mirror:attached";
}

/**
 * Mirror move event
 * @class MirrorMoveEvent
 * @module MirrorMoveEvent
 * @extends MirrorEvent
 */
export class MirrorMoveEvent extends MirrorEvent {
  static type = "mirror:move";
  static cancelable = true;

  /**
   * 是否超过了x轴的阈值
   * @type {Boolean}
   * @readonly
   */
  get passedThreshX() {
    return this.options.passedThreshX || false;
  }

  /**
   * 是否超过了y轴的阈值
   * @type {Boolean}
   * @readonly
   */
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

  /**
   * Draggables mirror element
   * @property mirror
   * @type {HTMLElement}
   * @readonly
   */
  get mirror() {
    return this.options.mirror;
  }
}
