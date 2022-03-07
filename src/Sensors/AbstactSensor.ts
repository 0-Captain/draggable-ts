import { Condition } from "../draggable";
import { AbstractEmitterEvents, Emitter } from "../Emitter";
import { SensorEvent } from "./SensorEvents";

export interface SensorOptions {
  condition: {
    delay: Delay;
    distance: number;
  };
  emitter: Emitter<AbstractEmitterEvents>;
  // container: Element;
  draggableElementSet: WeakSet<Element>;
}

/**
 * Sensor基类
 */
export class AbstractSensor {
  dragging = false;
  // readonly container = this.options.container;
  readonly emitter = this.options.emitter;
  readonly delay = this.options.condition.delay;
  readonly draggableELementSet = this.options.draggableElementSet;
  readonly distance = this.options.condition.distance;

  startEvent!: Event;

  /**
   * @description: 正在拖拽的元素，代表可拖动的DOM节点
   */
  source: HTMLElement = document.createElement("div");

  /**
   * @description: 当前坐标下方的元素，document.elementFromPoint(x,y)计算得到
   */
  target: HTMLElement | null = null;

  constructor(private options: SensorOptions) {
    // if (!(options.emitter instanceof Emitter)) {
    //   throw new Error("emitter must be contain in options");
    // }
  }

  /**
   * Attaches sensors event listeners to the DOM
   * @return {AbstractSensor}
   */
  attach() {
    throw new Error("Not Implemented");
  }

  /**
   * Detaches sensors event listeners to the DOM
   * @return {AbstractSensor}
   */
  detach() {
    throw new Error("Not Implemented");
  }

  /**
   * Triggers event on target element
   * @param {HTMLElement} element - Element to trigger event on
   * @param {SensorEvent} sensorEvent - Sensor event to trigger
   */
  async trigger(sensorEvent: SensorEvent) {
    await this.emitter.trigger(sensorEvent);

    return sensorEvent;
  }
}

/**
 * 根据传入的delay参数生成标准的delay类型
 */
export class Delay {
  private _mouse = 0;
  private _touch = 100;
  private _drag = 0;

  get mouse() {
    return this._mouse;
  }

  get touch() {
    return this._touch;
  }

  get drag() {
    return this._drag;
  }

  constructor(delay?: Condition["delay"]) {
    if (delay == undefined) return;
    if (typeof delay == "number") {
      this._mouse = delay;
      this._touch = delay;
      this._drag = delay;
    } else if (typeof delay == "object") {
      this._mouse = delay.mouse || this._mouse;
      this._touch = delay.touch || this._touch;
      this._drag = delay.drag || this._drag;
    } else {
      throw new Error("type error: options's type must be number || object");
    }
  }
}
