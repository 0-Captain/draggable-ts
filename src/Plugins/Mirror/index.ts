import { SensorEvent } from "@sensors/SensorEvents";
import { Draggable } from "src/draggable";
import {
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
} from "src/Events/DragEvents";
import { AbstractPlugin } from "../AbstractPlugin";

import {
  MirrorCreateEvent,
  MirrorMoveEvent,
  MirrorDestroyEvent,
  MirrorAttachedEvent,
} from "./MirrorEvents";

export interface MirrorOptions {
  constrainDimensions: boolean;
  xAxis: boolean;
  yAxis: boolean;
  cursorOffsetX: number | null;
  cursorOffsetY: number | null;
  thresholdX: number;
  thresholdY: number;
  appendTo?: string | HTMLElement;
}

export const mirrorDefaultOptions: MirrorOptions = {
  constrainDimensions: true,
  xAxis: true,
  yAxis: true,
  cursorOffsetX: null,
  cursorOffsetY: null,
  thresholdX: 0,
  thresholdY: 0,
};

export class Mirror extends AbstractPlugin {
  options: MirrorOptions = {
    ...mirrorDefaultOptions,
    ...this.draggable.options.mirror,
  };

  /** 监听scroll的距离，从而计算镜像移动的距离 */
  scrollOffset = { x: 0, y: 0 };

  initialScrollOffset = {
    x: window.scrollX,
    y: window.scrollY,
  };

  container = document.body;

  constructor(draggable: Draggable) {
    super(draggable);
    this.getMirrorContainer();
  }

  attach() {
    this.draggable.emitter
      .on("drag:start", this.onDragStart)
      .on("drag:move", this.onDragMove)
      .on("drag:end", this.onDragStop)
      .on("mirror:create", this.onMirrorCreated)
      .on("mirror:move", this.onMirrorMove);
  }

  detach() {
    this.draggable.emitter
      .off("drag:start", this.onDragStart)
      .off("drag:move", this.onDragMove)
      .off("drag:end", this.onDragStop)
      .off("mirror:create", this.onMirrorCreated)
      .off("mirror:move", this.onMirrorMove);
  }

  /** 获取mirror的options */
  getOptions() {
    return this.draggable.options.mirror || {};
  }

  private lastMirrorMovedClient?: { x: number; y: number };

  mirror: HTMLElement | null = null;

  private onDragStart = async (dragEvent: DragStartEvent) => {
    if (dragEvent.canceled || !dragEvent.source) {
      return;
    }

    if ("ontouchstart" in window) {
      document.addEventListener("scroll", this.onScroll, true);
    }

    this.initialScrollOffset = {
      x: window.scrollX,
      y: window.scrollY,
    };

    const { source, sensorEvent, originalEvent } = dragEvent;

    // Last sensor position of mirror move
    this.lastMirrorMovedClient = {
      x: sensorEvent.clientX,
      y: sensorEvent.clientY,
    };

    this.mirror = source.cloneNode(true) as HTMLElement;

    const mirrorCreateEvent = new MirrorCreateEvent({
      source,
      sensorEvent,
      originalEvent,
      options: this.options,
      dragEvent,
      mirror: this.mirror,
    });
    await this.draggable.emitter.trigger(mirrorCreateEvent);

    if (isNativeDragEvent(sensorEvent)) {
      return;
    }
    this.container.appendChild(this.mirror);

    const mirrorAttachedEvent = new MirrorAttachedEvent({
      source,
      sensorEvent,
      originalEvent,
      options: this.options,
      dragEvent,
      mirror: this.mirror,
    });

    await this.draggable.emitter.trigger(mirrorAttachedEvent);
  };

  private onDragMove = async (dragEvent: DragMoveEvent) => {
    if (!this.mirror) {
      return;
    }
    const { source, sensorEvent, originalEvent } = dragEvent;

    let passedThreshX = true;
    let passedThreshY = true;
    const { thresholdX, thresholdY } = this.options;

    // 如果x或y方向的移动的最少距离少于规定值则不触发事件
    if (thresholdX || thresholdY) {
      if (!this.lastMirrorMovedClient) return;
      const { x: lastX, y: lastY } = this.lastMirrorMovedClient;

      if (Math.abs(lastX - sensorEvent.clientX) < thresholdX) {
        passedThreshX = false;
      } else {
        this.lastMirrorMovedClient.x = sensorEvent.clientX;
      }

      if (Math.abs(lastY - sensorEvent.clientY) < this.options.thresholdY) {
        passedThreshY = false;
      } else {
        this.lastMirrorMovedClient.y = sensorEvent.clientY;
      }

      if (!passedThreshX && !passedThreshY) {
        return;
      }
    }

    const mirrorMoveEvent = new MirrorMoveEvent({
      source,
      sensorEvent,
      dragEvent,
      mirror: this.mirror,
      passedThreshX,
      passedThreshY,
      options: this.options,
      originalEvent,
    });

    await this.draggable.emitter.trigger(mirrorMoveEvent);
  };

  private onDragStop = async (dragEvent: DragEndEvent) => {
    if ("ontouchstart" in window) {
      document.removeEventListener("scroll", this.onScroll, true);
    }

    this.initialScrollOffset = { x: 0, y: 0 };
    this.scrollOffset = { x: 0, y: 0 };

    if (!this.mirror) {
      return;
    }

    const { source, sensorEvent, originalEvent } = dragEvent;

    const mirrorDestroyEvent = new MirrorDestroyEvent({
      source,
      mirror: this.mirror,
      options: this.options,
      sensorEvent,
      dragEvent,
      originalEvent,
    });

    await this.draggable.emitter.trigger(mirrorDestroyEvent);

    this.mirror.parentNode?.removeChild(this.mirror);
  };

  private onScroll = () => {
    this.scrollOffset = {
      x: window.scrollX - this.initialScrollOffset.x,
      y: window.scrollY - this.initialScrollOffset.y,
    };
  };

  mirrorOffset = {
    left: 0,
    top: 0,
  };
  initialX?: number;
  initialY?: number;
  lastMovedX?: number;
  lastMovedY?: number;

  private onMirrorCreated = ({
    mirror,
    source,
    sensorEvent,
  }: MirrorCreateEvent) => {
    if (!mirror) {
      return;
    }

    const setState = <
      T extends {
        mirrorOffset: Mirror["mirrorOffset"];
        initialX: number;
        initialY: number;
      }
    >(
      data: T
    ) => {
      const { mirrorOffset, initialX, initialY } = data;
      this.mirrorOffset = mirrorOffset;
      this.initialX = initialX;
      this.initialY = initialY;
      this.lastMovedX = initialX;
      this.lastMovedY = initialY;
      return data;
    };

    const initialState = {
      mirror,
      source,
      sensorEvent,
      scrollOffset: this.scrollOffset,
      options: this.options,
      passedThreshX: true,
      passedThreshY: true,
    };

    return (
      Promise.resolve(initialState)
        // Fix reflow here
        .then(computeMirrorDimensions)
        .then(calculateMirrorOffset)
        .then(resetMirror)
        .then((d) =>
          positionMirror({ initial: true })({
            ...d,
            initialX: 0,
            initialY: 0,
            lastMovedX: 0,
            lastMovedY: 0,
          })
        )
        .then(removeMirrorID)
        .then(setState)
    );
  };

  private onMirrorMove = (mirrorEvent: MirrorMoveEvent) => {
    const { mirror, sensorEvent, passedThreshX, passedThreshY } = mirrorEvent;
    if (!mirror) {
      return;
    }

    const setState = <T extends { lastMovedX?: number; lastMovedY?: number }>(
      data: T
    ) => {
      const { lastMovedX, lastMovedY } = data;
      this.lastMovedX = lastMovedX;
      this.lastMovedY = lastMovedY;

      return data;
    };

    const initialState = {
      mirror: mirror,
      sensorEvent: sensorEvent,
      mirrorOffset: this.mirrorOffset,
      options: this.options,
      initialX: this.initialX,
      initialY: this.initialY,
      scrollOffset: this.scrollOffset,
      passedThreshX: passedThreshX,
      passedThreshY: passedThreshY,
      lastMovedX: this.lastMovedX,
      lastMovedY: this.lastMovedY,
    };

    return Promise.resolve(initialState)
      .then(positionMirror({ withFrame: true }))
      .then(setState);
  };

  /** 根据appendTo获取container */
  private getMirrorContainer() {
    if (this.options.appendTo) {
      if (typeof this.options.appendTo === "string") {
        const container = document.querySelector(
          this.options.appendTo
        ) as HTMLElement;
        container && (this.container = container);
      } else if (this.options.appendTo instanceof HTMLElement) {
        this.container = this.options.appendTo;
      }
    }
  }
}

/** 初始化镜像元素时计算source的位置信息 */
function computeMirrorDimensions<T extends { source: HTMLElement }>(data: T) {
  return withPromise<T & { sourceRect: DOMRect }>((resolve) => {
    const sourceRect = data.source.getBoundingClientRect();
    resolve({ sourceRect, ...data });
  });
}

/** 初始化镜像元素时计算offset，如果options中没有配置，那么offset就是点击位置到元素左上角的距离的负数 */
function calculateMirrorOffset<
  T extends {
    sensorEvent: SensorEvent;
    sourceRect: DOMRect;
    options: MirrorOptions;
  }
>(data: T) {
  return withPromise<T & { mirrorOffset: { top: number; left: number } }>(
    (resolve) => {
      const { options, sourceRect, sensorEvent } = data;
      const top =
        options.cursorOffsetY == null
          ? sensorEvent.clientY - sourceRect.top
          : options.cursorOffsetY;
      const left =
        options.cursorOffsetX == null
          ? sensorEvent.clientX - sourceRect.left
          : options.cursorOffsetX;

      const mirrorOffset = { top, left };

      resolve({ mirrorOffset, ...data });
    }
  );
}

/** 初始化的时候计算元素样式，将source的样式应用到mirror上。 */
function resetMirror<
  T extends {
    mirror: HTMLElement;
    source: HTMLElement;
    options: MirrorOptions;
  }
>(data: T) {
  const { mirror, source, options } = data;
  return withPromise<T>((resolve) => {
    if (options.constrainDimensions) {
      const computedSourceStyles = getComputedStyle(source);
      // 获取影响视觉的属性，防止:last-child等伪类影响
      const repairCssProperty = [
        "font",
        "height",
        "width",
        "margin",
        "padding",
        "background",
      ] as const;
      repairCssProperty.forEach((property) => {
        mirror.style[property] =
          computedSourceStyles.getPropertyValue(property);
      });
    }

    mirror.style.position = "fixed";
    mirror.style.pointerEvents = "none";
    mirror.style.top = "0";
    mirror.style.left = "0";

    resolve(data);
  });
}

/** 移除元素id，防止对使用queryselector时对source产生影响 */
function removeMirrorID<
  T extends {
    mirror: HTMLElement;
  }
>(data: T) {
  const { mirror } = data;
  return withPromise<T>((resolve) => {
    mirror.removeAttribute("id");
    // delete mirror.id;
    resolve(data);
  });
}

/** 计算镜像相对于初始位置的便宜，也就是鼠标移动的距离，使用transform性能更好 */
function positionMirror({ withFrame = false, initial = false } = {}) {
  return <
    T extends {
      mirror: HTMLElement;
      sensorEvent: SensorEvent;
      mirrorOffset: Mirror["mirrorOffset"];
      initialY: Mirror["initialY"];
      initialX: Mirror["initialX"];
      scrollOffset: Mirror["scrollOffset"];
      options: MirrorOptions;
      passedThreshX: boolean;
      passedThreshY: boolean;
      lastMovedX: Mirror["lastMovedX"];
      lastMovedY: Mirror["lastMovedY"];
    }
  >(
    data: T
  ) => {
    const {
      mirror,
      sensorEvent,
      mirrorOffset,
      initialX,
      initialY,
      scrollOffset,
      options,
      passedThreshX,
      passedThreshY,
      lastMovedX = 0,
      lastMovedY = 0,
    } = data;
    return withPromise<T>(
      (resolve) => {
        const result = data;

        if (mirrorOffset) {
          const x = passedThreshX
            ? Math.round(
                (sensorEvent.clientX - mirrorOffset.left - scrollOffset.x) /
                  (options.thresholdX || 1)
              ) * (options.thresholdX || 1)
            : Math.round(lastMovedX);
          const y = passedThreshY
            ? Math.round(
                (sensorEvent.clientY - mirrorOffset.top - scrollOffset.y) /
                  (options.thresholdY || 1)
              ) * (options.thresholdY || 1)
            : Math.round(lastMovedY);

          if ((options.xAxis && options.yAxis) || initial) {
            mirror.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          } else if (options.xAxis && !options.yAxis) {
            mirror.style.transform = `translate3d(${x}px, ${initialY}px, 0)`;
          } else if (options.yAxis && !options.xAxis) {
            mirror.style.transform = `translate3d(${initialX}px, ${y}px, 0)`;
          }

          if (initial) {
            result.initialX = x;
            result.initialY = y;
          }

          result.lastMovedX = x;
          result.lastMovedY = y;
        }

        resolve(result);
      },
      { raf: withFrame }
    );
  };
}

/** 通过requestAnimationFrame减少不必要的运算 */
function withPromise<T>(
  callback: (resolve: (val: T) => void, reject: () => void) => void,
  { raf = false } = {}
) {
  return new Promise<T>((resolve, reject) => {
    if (raf) {
      requestAnimationFrame(() => {
        callback(resolve, reject);
      });
    } else {
      callback(resolve, reject);
    }
  });
}

/** 如果是浏览器原生拖拽事件的话通常不需要mirror */
function isNativeDragEvent(sensorEvent: SensorEvent) {
  return /^drag/.test(sensorEvent.originalEvent.type);
}
