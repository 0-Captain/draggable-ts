export abstract class AbstractEvent {
  static type = "event";
  abstract originalEvent: Event;

  get type(): string {
    return (this.constructor as unknown as AbstractEvent).type;
  }
}
