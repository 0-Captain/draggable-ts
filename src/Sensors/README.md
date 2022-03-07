## Sensor

sensor 采用适配器模式，主要作用是将不同的事件源统一并抽象为更高级的事件，将拖拽逻辑与浏览器 API 隔离，无需关心触发拖拽事件的底层实现。这主要有以下好处：

1. 可以很方便的增加新的 sensor（例如在 webview 中可以又 jsBridge 触发）。
2. 在新的平台无需更改已有的拖拽逻辑，保证代码复用性。

具体是将 dom 提供的事件源或其他事件源(例如 webview 由 jsBridge 提供的事件)抽象成 draggable 库的内部事件发布订阅系统的事件，并提供一些拖拽相关的重要属性，例如被拖拽的元素、落点位置的元素、鼠标坐标等。

主要抽象为以下三个事件

DragStartSensorEvent

DragMoveSensorEvent

DragStopSensorEvent

共同属性：
source：正在拖拽的元素，即 dragstart 时距离事件触发位置最近的可拖拽元素， 一定是 draggable 元素中的一员
target: 事件目标元素，即当前鼠标下方的元素，通过`document.elementFromPoint(event.clientX, event.clientY)`计算得到
clientX, clientY: 元素相对于屏幕的左上角的坐标。
pageX, pageY: 元素相对于 document 的左上角的坐标。
originalEvent: 事件源的事件

重要参数：

长按多长时间触发拖拽：delay

delay 事件内，最大移动距离：distance
