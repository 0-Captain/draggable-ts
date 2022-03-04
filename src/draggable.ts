import { Mirror, mirrorDefaultOptions, MirrorOptions } from "@plugins/Mirror";
import {
  DragMoveSensorEvent,
  DragStartSensorEvent,
  DragStopSensorEvent,
} from "@sensors/SensorEvents";
import { closest } from "@utils";
import { Emitter } from "./Emitter";
import {
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
} from "./Events/DragEvents";
import { AbstractPlugin } from "./Plugins";
import { Sensor, Delay } from "./Sensors";
import { MouseSensor } from "./Sensors/MouseSensor";

export type DraggableOptions = Partial<StrictDraggableOptions>;
export interface StrictDraggableOptions {
  container: string; // 拖拽容器
  draggable: string; // 容器中可拖拽的元素
  dropable: string;
  condition: Condition;
  sensors: Array<typeof Sensor>;
  mirror: MirrorOptions;
  plugins: Array<typeof AbstractPlugin>;
}

export interface Condition {
  delay?:
    | number
    | {
        mouse: number;
        touch: number;
        drag: number;
      };
  distance: number;
}

const defaultOptions: StrictDraggableOptions = {
  container: ".drag-container",
  draggable: ".draggable",
  dropable: ".draggable",
  condition: {
    delay: {
      mouse: 0,
      touch: 100,
      drag: 0,
    },
    distance: 0,
  },
  mirror: mirrorDefaultOptions,
  sensors: [MouseSensor],
  plugins: [Mirror],
};

export class DraggableBase {
  emitter = new Emitter();

  condition = {
    delay: new Delay(this.options.condition?.delay),
    distance: this.options.condition?.distance || 0,
  };

  sensors: Set<Sensor>;
  plugins: Set<AbstractPlugin>;

  container = document.querySelector(this.options.container) || document.body;

  draggableElementSet = new WeakSet(
    document.querySelectorAll(this.options.draggable)
  );
  dropableElementSet = new WeakSet(
    document.querySelectorAll(this.options.dropable || this.options.draggable)
  );

  constructor(public options: StrictDraggableOptions) {
    this.options = Object.assign(options, defaultOptions);

    this.emitter.on("sensor:dragstart", this.onDragStart);
    this.emitter.on("sensor:dragmove", this.onDragMove);
    this.emitter.on("sensor:dragstop", this.onDragEnd);
    // this.on('mirror:created', ({mirror}) => (this.mirror = mirror));
    // this.on('mirror:destroy', () => (this.mirror = null));

    this.sensors = new Set(this.options.sensors.map(this.addSensor.bind(this)));
    this.plugins = new Set(this.options.plugins.map(this.addPlugin.bind(this)));
  }

  dragging = false;
  source: HTMLElement | null = null;
  over: HTMLElement | null = null;
  private onDragStart = async (e: DragStartSensorEvent) => {
    if (!e.source) {
      return;
    }
    this.dragging = true;
    this.source = e.source;
    this.over = closest(e.target, this.dropableElementSet);

    const dragEvent = new DragStartEvent({
      source: this.source,
      target: e.target,
      over: this.over,
      originalEvent: e.originalEvent,
      sensorEvent: e,
    });

    await this.emitter.trigger(dragEvent);

    // console.log("drag;start");
  };

  private onDragMove = async (e: DragMoveSensorEvent) => {
    if (!this.source) {
      return;
    }
    const oldOver = this.over;
    this.over = closest(e.target, this.dropableElementSet);
    // console.log("dragmove");
    const eventData = {
      source: this.source,
      target: e.target,
      over: this.over,
      originalEvent: e.originalEvent,
      sensorEvent: e,
    };
    const dragMoveEvent = new DragMoveEvent(eventData);

    await this.emitter.trigger(dragMoveEvent);

    if (oldOver != this.over) {
      const dragOverEvent = new DragOverEvent(eventData);
      await this.emitter.trigger(dragOverEvent);
    }
  };

  private onDragEnd = async (e: DragStopSensorEvent) => {
    // console.log("drag end");
    this.dragging = false;
    if (!this.source) {
      return;
    }

    const dragEvent = new DragEndEvent({
      source: this.source,
      target: e.target,
      over: this.over,
      originalEvent: e.originalEvent,
      sensorEvent: e,
    });

    await this.emitter.trigger(dragEvent);
  };

  addSensor(Sen: typeof Sensor) {
    const instanceSensor = new Sen({
      condition: this.condition,
      emitter: this.emitter,
      draggableElementSet: this.draggableElementSet,
    });
    instanceSensor.attach();
    return instanceSensor;
  }

  addPlugin(Plugin: typeof AbstractPlugin) {
    const plugin = new Plugin(this);
    plugin.attach();
    return plugin;
  }

  removeSensor(sensor: Sensor) {
    sensor.detach();
    this.sensors.delete(sensor);
  }

  destroy() {
    //
  }
}

export class Draggable extends DraggableBase {
  constructor(options: DraggableOptions) {
    super(Object.assign(options, defaultOptions));
  }
}
