export interface Options {
  container: string; // 拖拽容器
  draggable: string; // 容器中可拖拽的元素
  dropable: string;
  // delay: number;
}

export class Draggable {
  // container = document.querySelector(this.option.container);
  // draggableElements = new WeakSet(document.querySelectorAll(this.option.dropable));
  // dropableElements = document.querySelectorAll(this.option.dropable || this.option.draggable);

  constructor(public options: Options) {
    for (const [key, val] of Object.entries(this.optionValidator)) {
      if (val.success == false) {
        throw new Error(
          `option error: ${key} are expected to be of type ${val.expect}`
        );
      }
    }
  }

  optionValidator = {
    container: {
      success: typeof this.options.container == "string",
      expect: "string",
    },
    draggable: {
      success: typeof this.options.container == "string",
      expect: "string",
    },
  };
}

export type Test = string;
