import { AbstractEvent } from ".";

export class DraggableInit {}

export class DragStartEvent extends AbstractEvent {
  static type = "drag:start";
}

export class DragMoveEvent extends AbstractEvent {
  static type = "drag:move";
}

export class DragEndEvent extends AbstractEvent {
  static type = "drag:end";
}
