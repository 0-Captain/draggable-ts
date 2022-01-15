interface AbstractEventProps {
  originalEvent: Event;
  source: Element;
}

export abstract class AbstractEvent {
  static type = "event";
  _originalEvent: Event;
  _source: Element;

  get type(): string {
    return (this.constructor as unknown as AbstractEvent).type;
  }

  get originalEvent() {
    return this._originalEvent;
  }

  constructor({ originalEvent, source }: AbstractEventProps) {
    this._originalEvent = originalEvent;
    this._source = source;
  }
}
