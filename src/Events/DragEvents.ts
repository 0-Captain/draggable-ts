import { AbstractEvent } from ".";

export class DraggableInit {}

export class DragStartEvent extends AbstractEvent {
  static type = "drag:start";
  originalEvent: Event;

  constructor(data: any) {
    super();
    this.originalEvent = data.originalEvent;
  }
}

export class DragMoveEvent extends AbstractEvent {
  static type = "drag:move";
  originalEvent: Event;

  constructor(data: any) {
    super();
    this.originalEvent = data.originalEvent;
  }
}

export class DragEndEvent extends AbstractEvent {
  static type = "drag:end";
  originalEvent: Event;

  constructor(data: any) {
    super();
    this.originalEvent = data.originalEvent;
  }
}
