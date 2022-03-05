import {
  DRAG_DELAY,
  defaultTouchEventOptions,
  defaultMouseEventOptions,
} from "./constants";
// // import { triggerEvent } from "./event";

// export function waitForDragDelay({
//   dragDelay = DRAG_DELAY,
//   restoreDateMock = true,
// } = {}) {
//   const next = Date.now() + dragDelay + 1;
//   const dateMock = jest.spyOn(Date, "now").mockImplementation(() => {
//     return next;
//   });
//   jest.advanceTimersByTime(dragDelay + 1);
//   if (restoreDateMock) {
//     dateMock.mockRestore();
//   }
//   return dateMock;
// }

// export function clickMouse(element: any, options = {}) {
//   return triggerEvent(element, "mousedown", {
//     ...defaultMouseEventOptions,
//     ...options,
//   });
// }

// export function moveMouse(element: any, options = {}) {
//   return triggerEvent(element, "mousemove", {
//     ...defaultMouseEventOptions,
//     ...options,
//   });
// }

// export function releaseMouse(element: any, options = {}) {
//   return triggerEvent(element, "mouseup", {
//     ...defaultMouseEventOptions,
//     ...options,
//   });
// }

// // eslint-disable-next-line @typescript-eslint/ban-types
// export function touchStart(element: any, options = {}) {
//   return triggerEvent(element, "touchstart", {
//     ...defaultTouchEventOptions,
//     ...options,
//   });
// }

// // eslint-disable-next-line @typescript-eslint/ban-types
// export function touchMove(element: any, options = {}) {
//   return triggerEvent(element, "touchmove", {
//     ...defaultTouchEventOptions,
//     ...options,
//   });
// }

// // eslint-disable-next-line @typescript-eslint/ban-types
// export function touchRelease(element: any, options = {}) {
//   return triggerEvent(element, "touchend", {
//     ...defaultTouchEventOptions,
//     ...options,
//   });
// }

// // eslint-disable-next-line @typescript-eslint/ban-types
// export function dragStart(element: any, options = {}) {
//   return triggerEvent(element, "dragstart", {
//     dataTransfer: getDataTransferStub(),
//     ...options,
//   });
// }

// // eslint-disable-next-line @typescript-eslint/ban-types
// export function dragOver(element: any, options = {}) {
//   return triggerEvent(element, "dragover", {
//     dataTransfer: getDataTransferStub(),
//     ...options,
//   });
// }

// // eslint-disable-next-line @typescript-eslint/ban-types
// export function dragDrop(element: any, options = {}) {
//   return triggerEvent(element, "drop", {
//     dataTransfer: getDataTransferStub(),
//     ...options,
//   });
// }

// // eslint-disable-next-line @typescript-eslint/ban-types
// export function dragStop(element: any, options = {}) {
//   return triggerEvent(element, "dragend", {
//     dataTransfer: getDataTransferStub(),
//     ...options,
//   });
// }

// export function getDataTransferStub() {
//   return {
//     setData: jest.fn(),
//     effectAllowed: null,
//   };
// }
