import { Mirror, mirrorDefaultOptions, MirrorOptions } from "@plugins/Mirror";
import {
  DragMoveSensorEvent,
  DragStartSensorEvent,
  DragStopSensorEvent,
} from "@sensors/SensorEvents";
import { closest } from "@utils";
import { AbstractEmitterEvents, Emitter } from "./Emitter";
import {
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
} from "./Events/DragEvents";
import {
  AbstractPlugin,
  MirrorCreateEvent,
  MirrorDestroyEvent,
  MirrorMoveEvent,
} from "./Plugins";
import { AbstractSensor, Delay } from "./Sensors";
import { MouseSensor } from "./Sensors/MouseSensor";

export type DraggableOptions = Partial<StrictDraggableOptions>;
export interface StrictDraggableOptions {
  draggable: string; // 容器中可拖拽的元素
  dropable: string;
  condition: Condition;
  sensors: Array<typeof AbstractSensor>;
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

export interface BaseEmitterEvents extends AbstractEmitterEvents {
  readonly "drag:start": DragStartEvent;
  readonly "drag:move": DragMoveEvent;
  readonly "drag:end": DragEndEvent;
  readonly "sensor:dragstart": DragStartSensorEvent;
  readonly "sensor:dragmove": DragMoveSensorEvent;
  readonly "sensor:dragstop": DragStopSensorEvent;
  readonly "mirror:create": MirrorCreateEvent;
  readonly "mirror:move": MirrorMoveEvent;
  readonly "mirror:destroy": MirrorDestroyEvent;
}

export class DraggableBase<EventsMap extends BaseEmitterEvents> {
  emitter = new Emitter<BaseEmitterEvents & EventsMap>();

  condition = {
    delay: new Delay(this.options.condition?.delay),
    distance: this.options.condition?.distance || 0,
  };

  sensors: Set<AbstractSensor>;
  plugins: Set<AbstractPlugin>;

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

  addSensor(Sen: typeof AbstractSensor) {
    const instanceSensor = new Sen({
      condition: this.condition,
      emitter: this.emitter as Emitter<BaseEmitterEvents>,
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

  removeSensor(sensor: AbstractSensor) {
    sensor.detach();
    this.sensors.delete(sensor);
  }

  destroy() {
    //
  }
}

export class Draggable<
  EventsMap extends BaseEmitterEvents = BaseEmitterEvents
> extends DraggableBase<EventsMap> {
  constructor(options: DraggableOptions) {
    super(Object.assign(options, defaultOptions));
  }
}
