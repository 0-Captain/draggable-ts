import { Emitter } from "./Emitter";
import { Sensor, Delay } from "./Sensors";

export interface DraggableOptions {
  container: string; // 拖拽容器
  draggable: string; // 容器中可拖拽的元素
  dropable: string;
  condition: {
    delay?:
      | number
      | {
          mouse: number;
          touch: number;
          drag: number;
        };
    distance: number;
  };
  sensors: Array<typeof Sensor>;
}

export class Draggable {
  emitter = new Emitter();

  sensors: Set<Sensor> = new Set();
  condition = {
    delay: new Delay(this.options.condition.delay),
    distance: this.options.condition.distance || 0,
  };

  container = document.querySelector(this.options.container) || document.body;

  draggableElementSet = new WeakSet(
    document.querySelectorAll(this.options.draggable)
  );
  dropableElementSet = new WeakSet(
    document.querySelectorAll(this.options.dropable)
  );

  constructor(public options: DraggableOptions) {
    //
    options.sensors.forEach((sensor) => this.addSensor(sensor));

    this.emitter.on("drag:start", () => this.onDragStart);
    this.emitter.on("drag:move", this.onDragMove);
    this.emitter.on("drag:end", this.onDragEnd);
  }

  onDragStart = () => {
    //
  };

  onDragMove = () => {
    //
  };

  onDragEnd = () => {
    //
  };

  addSensor(Sen: typeof Sensor) {
    const instanceSensor = new Sen({
      condition: this.condition,
      emitter: this.emitter,
      container: this.container,
      draggableElementSet: this.draggableElementSet,
    });
    instanceSensor.attach();
    this.sensors.add(instanceSensor);
  }

  removeSensor(sensor: Sensor) {
    sensor.detach();
    this.sensors.delete(sensor);
  }
}

export type Test = string;
