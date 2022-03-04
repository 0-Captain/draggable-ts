import { DraggableBase } from "src/draggable";

/**
 * All draggable plugins inherit from this class.
 * @abstract
 * @class AbstractPlugin
 * @module AbstractPlugin
 */
export class AbstractPlugin {
  /**
   * AbstractPlugin constructor.
   * @constructs AbstractPlugin
   * @param {Draggable} draggable - Draggable instance
   */
  constructor(public draggable: DraggableBase) {
    //
  }

  /**
   * Override to add listeners
   * @abstract
   */
  attach() {
    throw new Error("Not Implemented");
  }

  /**
   * Override to remove listeners
   * @abstract
   */
  detach() {
    throw new Error("Not Implemented");
  }
}
