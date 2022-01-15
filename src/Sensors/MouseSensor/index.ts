import { closest, distance as calcDistance } from "../../utils";
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
  mouseDownTimeout?: number;
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

    // const source = closest(
    //   event.target as HTMLElement,
    //   this.draggableELementSet
    // );
    // if (!source) {
    //   return;
    // }
    // this.source = source;

    // 记录mousedown时的相关信息
    const { pageX, pageY, clientX, clientY } = event;
    this.initPosition = { pageX, pageY, clientX, clientY };

    this.mouseDownEvent = event;

    this.addEvents(
      this.onMouseUp,
      preventNativeDragStart,
      this.onDistanceChange
    );
    // document.addEventListener("mouseup", this.onMouseUp);
    // document.addEventListener("dragstart", preventNativeDragStart);
    // document.addEventListener("mousemove", this.onDistanceChange);

    this.mouseDownTimeout = window.setTimeout(() => {
      this.isDelay = true;
      this.onDistanceChange({ pageX, pageY });
    }, this.delay.mouse);
  };

  /**
   * Detect change in distance, starting drag when both
   * delay and distance requirements are met
   * @private
   * @param {Event} event - Mouse move event
   */
  onDistanceChange = (event: MouseEvent | { pageX: number; pageY: number }) => {
    const { pageX, pageY } = event;
    const { initPosition, delay, distance } = this;

    if (!delay) {
      // moved during delay
      clearTimeout(this.mouseDownTimeout);
      document.removeEventListener("mousemove", this.onDistanceChange);
      return;
    }

    const distanceTravelled =
      calcDistance(initPosition.pageX, initPosition.pageY, pageX, pageY) || 0;

    if (distanceTravelled >= (distance || 0)) {
      document.removeEventListener("mousemove", this.onDistanceChange);
      this.startDrag();
    }
  };

  /**
   * Start the drag
   * @private
   */
  startDrag = () => {
    const startEvent = this.startEvent;
    const { source, initPosition } = this;

    const dragStartEvent = new DragStartSensorEvent({
      source,
      originalEvent: startEvent,
      ...initPosition,
    });

    this.trigger(dragStartEvent);

    this.dragging = true;
    if (this.dragging) {
      document.addEventListener(
        "contextmenu",
        this.onContextMenuWhileDragging,
        true
      );
      document.addEventListener("mousemove", this.onMouseMove);
    }
  };

  /**
   * Mouse move handler
   * @private
   * @param {Event} event - Mouse move event
   */
  onMouseMove = (event: MouseEvent) => {
    if (!this.dragging) {
      return;
    }

    const { pageX, pageY, clientX, clientY } = event;

    const target = document.elementFromPoint(event.clientX, event.clientY);

    const dragMoveEvent = new DragMoveSensorEvent({
      source: this.source,
      clientX,
      clientY,
      pageX,
      pageY,
      target,
      originalEvent: event,
    });

    this.trigger(dragMoveEvent);
  };

  /**
   * Mouse up handler
   * @private
   * @param {Event} event - Mouse up event
   */
  onMouseUp = (event: MouseEvent) => {
    clearTimeout(this.mouseDownTimeout);

    if (event.button !== 0) {
      return;
    }

    this.removeEvents(
      this.onMouseUp,
      preventNativeDragStart,
      this.onDistanceChange
    );
    // document.removeEventListener("mouseup", this.onMouseUp);
    // document.removeEventListener("dragstart", preventNativeDragStart);
    // document.removeEventListener("mousemove", this.onDistanceChange);

    if (!this.dragging) {
      return;
    }

    const target = document.elementFromPoint(event.clientX, event.clientY);

    const { clientX, clientY, pageX, pageY } = event;

    const dragStopEvent = new DragStopSensorEvent({
      clientX,
      clientY,
      pageX,
      pageY,
      target,
      source: this.source,
      originalEvent: event,
    });

    this.trigger(dragStopEvent);

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
  event.preventDefault();
}
