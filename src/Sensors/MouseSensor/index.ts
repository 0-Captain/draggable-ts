import { closest, distance as calcDistance } from "@utils";
import { Sensor, SensorOptions } from "..";
import {
  DragStartSensorEvent,
  DragMoveSensorEvent,
  DragStopSensorEvent,
} from "../SensorEvents";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (e: any) => any;

/**
 * This sensor picks up native browser mouse events and dictates drag operations
 * @class MouseSensor
 * @module MouseSensor
 * @extends Sensor
 */
export class MouseSensor extends Sensor {
  // Mouse down timer which will end up triggering the drag start operation
  mouseDownTimerId?: number;
  dragging = false;
  initPosition = {
    pageX: 0,
    pageY: 0,
    clientX: 0,
    clientY: 0,
  };

  private isDelay = false;
  private isDistance = false;

  mouseDownEvent?: MouseEvent;

  get canStartDrag() {
    return this.isDelay && this.isDistance;
  }

  /**
   * MouseSensor constructor.
   * @constructs MouseSensor
   * @param {HTMLElement[]|NodeList|HTMLElement} containers - Containers
   * @param {Object} options - Options
   */
  constructor(options: SensorOptions) {
    super(options);
  }

  /**
   * Attaches sensors event listeners to the DOM
   */
  attach() {
    document.addEventListener("mousedown", this.onMouseDown, true);
    return this;
  }

  /**
   * Detaches sensors event listeners to the DOM
   */
  detach() {
    document.removeEventListener("mousedown", this.onMouseDown, true);
    return this;
  }

  /**
   * Mouse down handler
   * @private
   * @param {Event} event - Mouse down event
   */
  onMouseDown = (event: MouseEvent) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey) {
      return;
    }

    const draggableElement = closest(
      (event.target ||
        document.elementFromPoint(event.clientX, event.clientY)) as HTMLElement,
      this.draggableELementSet
    );
    if (!draggableElement) {
      return;
    }
    // console.log("mouse down");
    this.source = draggableElement;

    // 记录mousedown时的相关信息
    const { pageX, pageY, clientX, clientY } = event;
    this.initPosition = { pageX, pageY, clientX, clientY };

    this.target = document.elementFromPoint(
      event.clientX,
      event.clientY
    ) as HTMLElement;

    this.mouseDownEvent = event;

    this.addEvents(
      this.onMouseUp,
      preventNativeDragStart,
      this.onDistanceChange
    );

    this.mouseDownTimerId = window.setTimeout(() => {
      this.isDelay = true;
      this.onDistanceChange({ pageX, pageY }, true);
    }, this.delay.mouse);
  };

  /**
   * Detect change in distance, starting drag when both
   * delay and distance requirements are met
   * @private
   * @param {Event} event - Mouse move event
   */
  onDistanceChange = (
    event: MouseEvent | { pageX: number; pageY: number },
    enable = false
  ) => {
    // console.log("onDistanceChange");
    const { pageX, pageY } = event;
    const { initPosition, distance } = this;
    this.removeEvents(this.onDistanceChange);

    if (!enable) {
      // moved during delay
      clearTimeout(this.mouseDownTimerId);
      return;
    }

    const distanceTravelled =
      calcDistance(initPosition.pageX, initPosition.pageY, pageX, pageY) || 0;

    if (distanceTravelled >= distance) {
      this.startDrag();
    }
  };

  /**
   * Start the drag
   * @private
   */
  startDrag = async () => {
    // console.log("start drag");
    const startEvent = this.startEvent;
    const { source, initPosition } = this;

    const dragStartEvent = new DragStartSensorEvent({
      source,
      target: this.target,
      originalEvent: startEvent,
      ...initPosition,
    });

    await this.trigger(dragStartEvent);

    this.dragging = true;
    if (this.dragging) {
      document.addEventListener(
        "contextmenu",
        this.onContextMenuWhileDragging,
        true
      );

      this.addEvents(this.onMouseMove);
    }
  };

  /**
   * Mouse move handler
   * @private
   * @param {Event} event - Mouse move event
   */
  onMouseMove = async (event: MouseEvent) => {
    // console.log("mouse move");
    if (!this.dragging || !event.target) {
      return;
    }

    const { pageX, pageY, clientX, clientY } = event;

    /**
     * elementFromPoint：获取视觉上最顶层的元素（不同层级中更高层级的元素，同一层级中最内层的元素）
     * 通常情况下elementFromPoint和event target相同，但是不同设备或浏览器中可能会有差异，例如ios设备上，touchmove时，获取不到手指指向的元素，
     */
    this.target = document.elementFromPoint(
      event.clientX,
      event.clientY
    ) as HTMLElement;
    // console.log(target == event.target);
    const dragMoveEvent = new DragMoveSensorEvent({
      source: this.source,
      target: this.target,
      clientX,
      clientY,
      pageX,
      pageY,
      originalEvent: event,
    });

    await this.trigger(dragMoveEvent);
  };

  /**
   * Mouse up handler
   * @private
   * @param {Event} event - Mouse up event
   */
  onMouseUp = async (event: MouseEvent) => {
    // console.log("mouse up");
    clearTimeout(this.mouseDownTimerId);

    if (event.button !== 0) {
      return;
    }

    this.removeEvents(
      this.onMouseUp,
      preventNativeDragStart,
      this.onDistanceChange
    );

    if (!this.dragging) {
      return;
    }

    this.target = document.elementFromPoint(
      event.clientX,
      event.clientY
    ) as HTMLElement;

    const { clientX, clientY, pageX, pageY } = event;

    const dragStopEvent = new DragStopSensorEvent({
      clientX,
      clientY,
      pageX,
      pageY,
      target: this.target,
      source: this.source,
      originalEvent: event,
    });

    await this.trigger(dragStopEvent);

    document.removeEventListener(
      "contextmenu",
      this.onContextMenuWhileDragging,
      true
    );

    this.addEvents(this.onMouseMove);
    // document.removeEventListener("mousemove", );

    this.dragging = false;
    this.mouseDownEvent = undefined;
  };

  /**
   * Context menu handler
   * @private
   * @param {Event} event - Context menu event
   */
  onContextMenuWhileDragging = (event: Event) => {
    event.preventDefault();
  };

  eventMap = new Map([
    [this.onMouseDown, "mousedown"],
    [this.onMouseMove, "mousemove"],
    [this.onMouseUp, "mouseup"],
    [this.onDistanceChange, "mousemove"],
    [preventNativeDragStart, "dragstart"],
    [this.onContextMenuWhileDragging, "contextmenu"],
  ]);

  addEvents(...handlers: Array<EventHandler>) {
    for (const handler of handlers) {
      const eventType = this.eventMap.get(handler);
      eventType && document.addEventListener(eventType, handler);
    }
  }

  removeEvents(...handlers: Array<EventHandler>) {
    for (const handler of handlers) {
      const eventType = this.eventMap.get(handler);
      eventType && document.removeEventListener(eventType, handler);
    }
  }
}

function preventNativeDragStart(event: Event) {
  // console.log("prevent");
  event.preventDefault();
}
