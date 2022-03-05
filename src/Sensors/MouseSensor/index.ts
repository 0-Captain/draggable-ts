import { closest, distance as calcDistance } from "@utils";
import { AbstractSensor, SensorOptions } from "../AbstactSensor";
import {
  DragStartSensorEvent,
  DragMoveSensorEvent,
  DragStopSensorEvent,
} from "../SensorEvents";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (e: any) => any;

/** 监听浏览器的mouse事件 */
export class MouseSensor extends AbstractSensor {
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

  get canStartDrag() {
    return this.isDelay && this.isDistance;
  }

  constructor(options: SensorOptions) {
    super(options);
  }

  /** Attaches sensors event listeners to the DOM */
  attach() {
    document.addEventListener("mousedown", this.onMouseDown, true);
    return this;
  }

  /** Detaches sensors event listeners to the DOM */
  detach() {
    document.removeEventListener("mousedown", this.onMouseDown, true);
    return this;
  }

  /** Mouse down handler */
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

    this.startEvent = event;

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
   * 检测鼠标按下后到鼠标开始移动的过程中是否满足时间和距离的条件，不满足则取消拖拽。
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

    this.dragging = true;
    if (this.dragging) {
      console.log("add listener");
      document.addEventListener(
        "contextmenu",
        this.onContextMenuWhileDragging,
        true
      );

      this.addEvents(this.onMouseMove);
    }
    await this.trigger(dragStartEvent);
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

  /** Mouse up handler */
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
  };

  /* 阻止鼠标右键点击出现的菜单 */
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
