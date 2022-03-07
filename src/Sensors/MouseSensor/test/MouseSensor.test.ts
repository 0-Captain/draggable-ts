import { MouseSensor } from "..";
import { Delay } from "../../AbstactSensor";
import { Emitter } from "../../../Emitter";
import { createSandbox } from "../../../../test/helper";
import { BaseEmitterEvents } from "src/draggable";

expect.extend({
  toHaveDefaultPrevented(e: Event) {
    const pass = e.defaultPrevented;

    return {
      pass,
      message: () => {
        const expectation = pass ? "not to have" : "to have";
        return `Expected dom event '${e.type}' ${expectation} default prevented`;
      },
    };
  },
});

const sampleMarkup = `
  <ul>
    <li class="draggable">
      First item
    </li>
    <li class="draggable" >
      Second item
    </li>
    <li class="not-draggable">
      Third item
    </li>
    <li class="not-draggable">
      Fourth item
    </li>
  </ul>
`;
jest.useFakeTimers();
let mouseSensor: MouseSensor;
let sandBox: HTMLElement;
let draggableElement: HTMLElement;
let notDraggableElement: HTMLElement;

beforeEach(() => {
  sandBox = createSandbox(sampleMarkup);
  draggableElement = sandBox.querySelector(".draggable") as HTMLLIElement;
  notDraggableElement = sandBox.querySelector(
    ".not-draggable"
  ) as HTMLLIElement;
  dispatchEventPolyfill(draggableElement);
  dispatchEventPolyfill(notDraggableElement);

  mouseSensor = new MouseSensor({
    emitter: new Emitter<BaseEmitterEvents>(),
    condition: {
      delay: new Delay(0),
      distance: 0,
    },
    draggableElementSet: new WeakSet(document.querySelectorAll(".draggable")),
  });
  mouseSensor.attach();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  draggableElement.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  notDraggableElement.dispatchEvent(
    new MouseEvent("mouseup", { bubbles: true })
  );
  mouseSensor.detach();
});

test("does not trigger `drag:start` event when clicking on non draggable element", async () => {
  const eventCallbacks = jest.fn();
  mouseSensor.emitter.on("sensor:dragstart", eventCallbacks);
  click(notDraggableElement);
  jest.runOnlyPendingTimers();
  expect(eventCallbacks).not.toBeCalled();
});

test("MouseSensor: prevents context menu while dragging", () => {
  mouseSensor.onContextMenuWhileDragging = jest.fn();

  draggableElement.dispatchEvent(
    new MouseEvent("mousedown", {
      bubbles: true,
    })
  );
  jest.runAllTimers();
  draggableElement.dispatchEvent(
    new MouseEvent("contextmenu", { bubbles: true })
  );

  expect(mouseSensor.onContextMenuWhileDragging).toBeCalled();

  jest.runAllTimers();
});

test("prevents native drag when initiating drag flow", () => {
  const dragEvent1 = triggerEvent(draggableElement, "dragstart");
  expect(dragEvent1).not.toHaveDefaultPrevented();

  draggableElement.dispatchEvent(new MouseEvent("mousedown"));
  const dragEvent2 = triggerEvent(draggableElement, "dragstart");

  expect(dragEvent2).toHaveDefaultPrevented();

  draggableElement.dispatchEvent(new MouseEvent("mouseup"));
});

function click(target: HTMLElement) {
  triggerEvent(target, "mousedown", { button: 0 });
  jest.runOnlyPendingTimers();

  triggerEvent(target, "mouseup", { button: 0 });
  triggerEvent(target, "click", { button: 0 });
}

function triggerEvent(element: HTMLElement, type: string, options = {}) {
  // 由于部分event（例如DragEvent）jsdom未实现，所以只能用这种创建event的方法
  const event = document.createEvent("Event");
  event.initEvent(type, true, true);
  Object.assign(event, options);

  withElementFromPoint(element, () => {
    element.dispatchEvent(event);
  });

  return event;
}

// function drag({
//   target: HTMLElement,

// }){

// }

/** 执行callback函数时，让document.elementFromPoint调用结果返回 target。
 * 原因是jsdom不支持document.elementFromPoint */
export function withElementFromPoint<T extends () => any>(
  target: HTMLElement,
  callback: T
): T extends (e: Event) => infer P ? P : unknown {
  const originalElementFromPoint = document.elementFromPoint;
  document.elementFromPoint = () => target;
  const res = callback();
  document.elementFromPoint = originalElementFromPoint;
  return res;
}

function dispatchEventPolyfill(element: HTMLElement) {
  const originalDispatchEvent = element.dispatchEvent;
  element.dispatchEvent = function (event) {
    return withElementFromPoint(
      element,
      originalDispatchEvent.bind(this, event)
    );
  };
}
