# 高性能的通用拖拽库

### 特点：

1. 统一移动端与 PC 端拖拽事件，并进一步抽象出常见拖拽场景的各种事件
2. 提供拖拽镜像、落点提示线、边缘滚动等基础 plugin
3. 完善的 TS 类型，优秀的代码设计

### 拖拽触发条件

1. delay
   防止在打算滚动时触发拖拽

2. distance
   防止在点击时触发拖拽

### 优化：

1. 事件发布订阅系统：

- 使用 Map 代替数组，`on`,`off`的时间复杂度都提升到 O(1)
- 增加回调函数权重信息，灵活控制回调函数执行顺序
- `trigger`改为异步，保证异步回调函数的执行顺序
- 类型优化，类型提示增强
