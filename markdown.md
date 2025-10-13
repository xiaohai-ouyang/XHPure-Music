# xiaohi-Marquee 组件文档

## 简介

xiaohi-Marquee 是一个用于实现文本滚动效果（跑马灯）的 Vue 组件库。它提供了两种使用方式：组合式函数 `useMarquee` 和指令 `v-marquee`。最新版本增加了对多种滚动控制模式的支持。

## 特性

- 支持自定义滚动速度
- 支持自动滚动和手动控制
- 提供两种交互模式：
  - 默认模式：自动滚动，鼠标悬停时暂停
  - 鼠标悬停模式：仅在鼠标悬停时滚动
- 响应式设计，自动适配容器大小变化
- 无缝滚动效果

## 安装和使用

### 组合式函数方式

```typescript
import { useMarquee } from '@/composables/marquee'

// 在组件中使用
export default {
  setup() {
    const marquee = useMarquee({
      speed: 30, // 滚动速度 (像素/秒)
      autoScroll: true, // 是否自动开始滚动
      pauseOnHover: true, // 鼠标悬停时是否暂停 (默认模式)
      mouseHover: false, // 是否使用鼠标悬停模式
    })

    return {
      marquee,
    }
  },
  mounted() {
    this.marquee.init()
  },
}
```

```html
<template>
  <div ref="marquee.container" class="XiaoHi-marquee-container">
    <span class="XiaoHi-marquee-content">这是要滚动的文本内容</span>
  </div>
</template>
```

### 指令方式

```html
<!-- 基础用法 -->
<div v-marquee>要滚动的文本</div>

<!-- 设置滚动速度 -->
<div v-marquee="30">要滚动的文本</div>

<!-- 配置详细参数 -->
<div v-marquee="{speed: 30, pauseOnHover: true, mouseHover: false, auto: true}">要滚动的文本</div>
```

## 配置参数

| 参数名       | 类型    | 默认值 | 描述                           |
| ------------ | ------- | ------ | ------------------------------ |
| speed        | Number  | 50     | 滚动速度（像素/秒）            |
| autoScroll   | Boolean | true   | 是否启用自动滚动（组合式函数） |
| auto         | Boolean | true   | 是否启用自动滚动（指令）       |
| pauseOnHover | Boolean | true   | 鼠标悬停时是否暂停（默认模式） |
| mouseHover   | Boolean | false  | 是否启用鼠标悬停模式           |

## 滚动模式说明

### 默认模式 (`mouseHover: false`)

在这种模式下，文本会自动开始滚动，当鼠标悬停在文本上时会暂停滚动，鼠标离开后继续滚动。

适用场景：通知栏、歌曲标题等需要持续展示但又希望用户能够暂停阅读的场景。

### 鼠标悬停模式 (`mouseHover: true`)

在这种模式下，文本默认是静止的，只有当鼠标悬停在文本上时才开始滚动，鼠标离开后停止滚动。

适用场景：列表项、菜单项等平时保持静态，仅在用户关注时展示完整信息的场景。

## 注意事项

1. 确保容器具有明确的宽度限制，以便正确计算是否需要滚动
2. 内容文本应该放在带有 `XiaoHi-marquee-content` 类的元素中（组合式函数方式）
3. 当文本长度不超过容器宽度时，不会触发滚动效果
4. 组件会在组件卸载时自动清理事件监听器和动画

## 示例

### 基础示例

```html
<template>
  <div class="demo">
    <h3>默认模式</h3>
    <div v-marquee="40" class="marquee-item">
      这是一段很长的文本，用来演示默认的滚动效果，它会自动开始滚动。
    </div>

    <h3>鼠标悬停模式</h3>
    <div v-marquee="{speed: 40, mouseHover: true}" class="marquee-item">
      这是另一段很长的文本，用来演示鼠标悬停模式，只有悬停时才会滚动。
    </div>
  </div>
</template>

<style scoped>
  .marquee-item {
    width: 200px;
    border: 1px solid #ccc;
    padding: 8px;
    margin: 10px 0;
  }
</style>
```

## API

### useMarquee(options)

创建一个 marquee 实例

#### 参数

- options: MarqueeOptions
  - speed?: number - 滚动速度（像素/秒），默认 50
  - autoScroll?: boolean - 是否启用自动滚动，默认 true
  - pauseOnHover?: boolean - 鼠标悬停时是否暂停，默认 true
  - mouseHover?: boolean - 是否使用鼠标悬停模式，默认 false

#### 返回值

```typescript
interface MarqueeInstance {
  containerRef: HTMLElement | null // 容器引用
  init: () => void // 初始化函数
  start: () => void // 开始滚动
  stop: () => void // 停止滚动
  update: () => void // 更新内容
}
```

### v-marquee 指令

文本滚动指令

#### 用法

```html
<div v-marquee>滚动文本</div>
<div v-marquee="25">滚动文本（速度25px/s）</div>
<div v-marquee="{speed: 30, pauseOnHover: false, mouseHover: true}">滚动文本</div>
```
