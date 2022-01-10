import { AbstractEvent } from "../../Events";
import { Emitter, BaseEmitterEvents } from "../../Emitter";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      isMapKey(key: unknown): R;
    }
  }
}

expect.extend({
  isMapKey(map: Map<any, any>, key: any) {
    const pass = map.has(key);

    if (pass) {
      return {
        message: () => `expected ${key} not to be contained by ${map}`,
        pass,
      };
    } else {
      return {
        message: () => `expected ${key} to be contained by ${map}`,
        pass,
      };
    }
  },
});

const TestEventType = "test:event";

class TestEvent extends AbstractEvent {
  static type = TestEventType;
  originalEvent = new Event("testEvent");
}

interface TestEmitterEvents extends BaseEmitterEvents {
  "test:event": TestEvent;
}

let emitter: Emitter<TestEmitterEvents>;

beforeEach(() => {
  emitter = new Emitter<TestEmitterEvents>();
});

test("registers a callback by event type", () => {
  const callback = jest.fn();

  emitter.on(TestEventType, callback);

  expect(emitter.events[TestEventType]).isMapKey(callback);
});

test("removes a callback by event type", () => {
  const callback = jest.fn();

  emitter.on(TestEventType, callback);

  expect(emitter.events[TestEventType]).isMapKey(callback);

  emitter.off(TestEventType, callback);

  expect(emitter.events[TestEventType]).not.isMapKey(callback);
});

test("triggers callbacks on event with test event", () => {
  const testEvent = new TestEvent();
  const callback = jest.fn();

  emitter.on(TestEventType, callback);
  emitter.trigger(testEvent);

  expect(callback).toHaveBeenCalled();
  expect(callback).toHaveBeenCalledWith(testEvent);
});

test("catches errors from listeners and re-throws at the end of the trigger phase", async () => {
  const consoleErrorSpy = jest.fn();

  const testEvent = new TestEvent();
  const error = new Error("Error");
  const callbacks = [
    jest.fn(),
    () => {
      throw error;
    },
    jest.fn(),
  ];

  console.error = consoleErrorSpy;

  callbacks.forEach((cb) => {
    emitter.on(TestEventType, cb);
  });

  await emitter.trigger(testEvent);

  expect(consoleErrorSpy).toHaveBeenCalled();
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "Draggable caught errors while triggering 'test:event'",
    [error]
  );

  expect(callbacks[0]).toHaveBeenCalled();
  expect(callbacks[2]).toHaveBeenCalled();
});
