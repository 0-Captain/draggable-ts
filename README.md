# 高性能的通用拖拽库

## 特点：

1. 统一移动端与 PC 端拖拽事件，并进一步抽象出常见拖拽场景的各种事件
2. 提供拖拽镜像、落点提示线、边缘滚动等基础 plugin
3. 完善的 TS 类型，优秀的代码设计

## 使用指南

#### 名次解释

- source：拖拽的目标元素
- mirror：镜像元素
- over：拖拽过程中经过的 dropable 的元素

#### Quick Start

```typescript
// default options
const options = {
  draggable: ".draggable", // 可拖拽元素的selector，
  dropable: ".draggable", // 可放置元素的selector，主要影响拖拽事件的over属性
  condition: {
    // 触发拖拽的条件
    delay: {
      // 需要长按多少ms才会触发拖拽
      mouse: 0,
      touch: 100, // 防止移动端滚动页面时触发拖拽
      drag: 0,
    },
    distance: 0, // 需要移动超过这个距离才会触发拖拽，防止click误触
  },
  sensors: [MouseSensor], // 要使用的Sensor
  plugins: [Mirror], // 要使用的plugin
  mirror: {
    // Mirror plugin的配置
    constrainDimensions: true, // mirror是否维持source的外观
    xAxis: true, // 是否允许y轴移动
    yAxis: true, // 是否允许x轴移动
    cursorOffsetX: null, // 元素相对于鼠标的x轴偏移，null表示元素距离鼠标的x轴距离，此时正好mirror的位置与source重合
    cursorOffsetY: null, // 元素相对于鼠标的y轴偏移，与cursorOffsetX同理
    thresholdX: 0, // mirror在x轴移动的步长
    thresholdY: 0, // mirror在y轴移动的步长
  },
};

const draggable = new Draggable(options);

// 拖拽结束时将source插入到over之前
draggable.emitter.on("drag:end", (e) => {
  if (e.over) {
    e.over.parentElement?.insertBefore(e.over, e.source);
  }
});
```
