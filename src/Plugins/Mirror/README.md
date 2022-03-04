## Mirror Plugin

作用：用来生成 source（拖拽元素）的镜像，并跟随鼠标移动。

原理：基于 drag:start, drag:move, drag:stop 这三个事件来生成并移动镜像元素位置

options

- constrainDimensions: boolean;
  是否还原 source 的形状。

- xAxis: boolean;
  是否允许 x 轴上的移动

- yAxis: boolean;
  是否允许 y 轴上的移动

- cursorOffsetX: number;
  镜像在 x 轴上的偏移距离

- cursorOffsetY: number;
  镜像在 y 轴上的偏移距离

- thresholdX: number;
  X 轴上移动的步长。具体来说是鼠标在 x 轴上的位置，距离上一次需要再移动 thresholdX 的距离才会让镜像元素移动一次。
- thresholdY: number;
  Y 轴上移动的步长
- appendTo?: string | HTMLElement;
  镜像元素的父元素，如果是 string 的话会用 document.querySelector 来获取。
