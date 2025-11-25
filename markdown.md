# 📚 项目功能组件与模块文档

> **更新时间：2025年10月14日**

本文档涵盖以下核心内容：

- `SmartMarquee` 智能滚动文本组件
- 播放列表（Playlist）功能实现
- 相关 Composable 工具函数使用指南

---

## 一、SmartMarquee 组件 —— 智能文本滚动

### ✅ 简介

`SmartMarquee` 是基于 `vue3-marquee` 封装的智能文本滚动组件。它仅在内容超出容器时自动启用滚动动画，避免不必要的性能开销，提升用户体验。

### 🔧 特性

|     功能     |                 说明                  |
| :----------: | :-----------------------------------: |
|   智能检测   | 自动判断是否需要滚动（根据宽/高溢出） |
|  响应式支持  |   容器尺寸变化后重新检测并调整行为    |
|   多种方向   |     支持水平/垂直、正向/反向滚动      |
| 鼠标悬停暂停 |            可配置是否开启             |
|   渐变遮罩   |           边缘淡出视觉效果            |
|   强制滚动   |      忽略溢出检测，强制启动动画       |

### 📦 安装依赖

```
npm install vue3-marquee
```

---

### 🛠️ 使用方式

#### 1. 基本用法（通过 `text` 属性）

```
<template>
  <SmartMarquee
    :duration="20"
    :pause-on-hover="true"
    direction="normal"
    :vertical="false"
    :gradient="false"
    gradient-width="60px"
    text="这是一段很长的文本，只有超出容器才会滚动..."
  />
</template>

<script setup>
import SmartMarquee from '@/components/Common/SmartMarquee.vue'
</script>
```

#### 2. 插槽方式（更灵活的内容渲染）

```
<template>
  <SmartMarquee :duration="15">
    <span style="color: red;">自定义 HTML 内容</span>
  </SmartMarquee>
</template>
```

> ⚠️ 注意：使用插槽时，`text` 属性将被忽略。

---

### ⚙️ 参数配置表

|     参数名      |          类型           |   默认值   |             说明             |
| :-------------: | :---------------------: | :--------: | :--------------------------: |
|   `duration`    |        `number`         |    `20`    |    滚动一圈所需时间（秒）    |
| `pauseOnHover`  |        `boolean`        |   `true`   |     鼠标悬停是否暂停滚动     |
|   `direction`   | `'normal' \| 'reverse'` | `'normal'` |           滚动方向           |
|   `vertical`    |        `boolean`        |  `false`   |        是否为垂直滚动        |
|   `gradient`    |        `boolean`        |  `false`   |     是否显示边缘渐变遮罩     |
| `gradientWidth` |        `string`         |  `'60px'`  |   渐变区域宽度（CSS 单位）   |
|     `text`      |        `string`         |    `''`    |       要显示的文本内容       |
|     `force`     |        `boolean`        |  `false`   | 强制启用滚动（无视溢出检测） |

---

### 💡 工作原理

1. 组件加载或窗口大小改变时，检测内容是否溢出容器。
2. 若发生溢出 → 启动 `vue3-marquee` 动画。
3. 未溢出 → 静态展示，不执行动画。
4. 支持响应式重计算。

---

### 📌 注意事项

- 确保父容器有明确宽度（如 `width: 100%`），否则无法正确检测溢出。
- 不建议同时设置 `text` 和插槽内容，优先使用插槽。
- 设置 `force=true` 可用于调试或强制展示滚动效果。

---

### 🎯 示例代码

```
<template>
  <div class="demo" style="width: 300px;">
    <!-- 默认水平滚动 -->
    <h3>默认滚动</h3>
    <SmartMarquee :duration="15" text="一段超长文本，自动判断是否滚动..." />

    <!-- 渐变遮罩 -->
    <h3>带渐变遮罩</h3>
    <SmartMarquee :gradient="true" gradient-width="40px" text="边缘有淡出效果" />

    <!-- 垂直反向滚动（强制） -->
    <h3>垂直反向滚动</h3>
    <SmartMarquee
      :duration="10"
      :vertical="true"
      direction="reverse"
      :force="true"
      text="第一行\n第二行\n第三行"
    />
  </div>
</template>
```

---

## 二、播放列表（Playlist）功能实现

### 📄 数据结构

#### `Playlist` 接口

```
interface Playlist {
  id: string // 播放列表唯一 ID
  name: string // 名称
  cover: string // 封面路径（特殊格式：indexeddb://${id}）
  tracks: Track[] // 歌曲列表
}
```

#### `Track` 接口

```
interface Track {
  id: string // 歌曲 ID（导入后填充）
  title: string // 标题
  duration: number // 时长（秒）
  md5: string // 唯一哈希标识
}
```

---

### 🗃️ 核心实现机制

#### 1. 状态管理（Pinia + localStorage）

- 使用 Pinia 管理全局播放列表状态。
- 所有数据持久化存储于 `localStorage`，键名为：`xhpure_playlists`。
- 每次修改自动同步保存。

#### 2. 封面图片存储（IndexedDB）

- 减轻 `localStorage` 存储压力。
- 使用组合式函数 `useCoverStorage` 管理。
- URL 格式：`indexeddb://playlist-id`

---

### 🔩 核心功能方法（来自 `playlistStores.ts`）

|             方法              |                  参数                   |                说明                |
| :---------------------------: | :-------------------------------------: | :--------------------------------: |
| `createPlaylist(newPlaylist)` |             `Playlist` 对象             |      创建新播放列表，检查重名      |
|  `addInPlaylist(id, music)`   |  `id`: 播放列表ID<br>`music`: 歌曲信息  | 添加歌曲，防重复（md5 + duration） |
|   `clearPlaylistTracks(id)`   |            `id`: 播放列表ID             |         清空该列表所有歌曲         |
|       `getPlaylists()`        |                    —                    |        获取全部播放列表数组        |
| `updatePlaylists(playlists)`  |            新的播放列表数组             |        替换整个播放列表集合        |
| `updateTrackIdByMusic(music)` | 包含 `id`, `md5`, `duration` 的音乐对象 |        更新 track 的真实 ID        |
| `getTracksByMusicId(musicId)` |                 歌曲 ID                 | 返回包含此歌曲的所有播放列表及位置 |

---

### 📈 状态属性（Store 实例暴露）

|    属性    |       类型        |                说明                 |
| :--------: | :---------------: | :---------------------------------: |
| `playlist` | `Ref<Playlist[]>` |     当前所有播放列表（响应式）      |
|   `msg`    |     `string`      | 上一次操作结果提示消息（成功/失败） |

---

### 💬 使用示例（Vue 组件中）

```
<template>
  <div>
    <div v-for="pl in playlistStore.playlist" :key="pl.id">
      <h3>{{ pl.name }}</h3>
      <p>歌曲数：{{ pl.tracks.length }}</p>
      <button @click="clearTracks(pl.id)">清空</button>
    </div>
    <p><strong>状态：</strong>{{ playlistStore.msg }}</p>
  </div>
</template>

<script setup>
import { usePlaylistStore } from '@/stores/playlistStores'

const playlistStore = usePlaylistStore()

function clearTracks(id) {
  playlistStore.clearPlaylistTracks(id)
}
</script>
```

---

### 🧱 组件与页面说明

|         组件/页面          |             作用             |
| :------------------------: | :--------------------------: |
|     `PlaylistCard.vue`     |      播放列表缩略图卡片      |
| `CreatePlaylistDialog.vue` | 创建播放列表弹窗（可选封面） |
|    `PlaylistLayout.vue`    |       播放列表详情布局       |
|    `PlaylistsPage.vue`     |      所有播放列表总览页      |
|  `PlaylistDetailPage.vue`  |      单个播放列表详情页      |

---

### ❗ 注意事项

- 播放列表中的歌曲只保留基本元数据（不含完整 ID）。
- 歌曲导入后会通过 `md5` 和 `duration` 匹配并更新其 `id`。
- 封面存储使用 IndexedDB，需配合 `useCoverStorage` 使用。
- 所有数据变更均自动持久化到 `localStorage`。

---

## 三、工具类 Composable 使用指南

---

### 1. `useChineseToggle` —— 控制歌词中文显示

#### 📌 功能

控制双语歌词中“中文”的显隐切换，并提供相关判断逻辑。

#### ✅ 导入与初始化

```
import { useChineseToggle } from '@/composables/useChineseToggle'

const { removeChinese, hasChinese, translationTooltip, toggleChinese } =
  useChineseToggle(lyricsText)
```

#### 🔍 返回值说明

| 变量/函数            | 类型                   | 说明                             |
| -------------------- | ---------------------- | -------------------------------- |
| `removeChinese`      | `Ref<boolean>`         | 是否隐藏中文（`true`=隐藏）      |
| `hasChinese`         | `ComputedRef<boolean>` | 歌词中是否包含中文字符           |
| `translationTooltip` | `ComputedRef<string>`  | 提示文字：“显示中文”或“隐藏中文” |
| `toggleChinese()`    | `Function`             | 切换中文显示状态                 |

#### 🖼️ 模板使用示例

```
<template>
  <button v-if="hasChinese" @click="toggleChinese" :title="translationTooltip">
    {{ removeChinese ? '显示中文' : '隐藏中文' }}
  </button>
</template>
```

---

### 2. `useCoverStorage` —— 封面图片存储管理

#### 📌 功能

封装对封面图片的增删改查操作，底层使用 IndexedDB。

#### ✅ 导入与初始化

```
import { useCoverStorage } from '@/composables/useCoverStorage'

const { isLoading, error, saveCover, getCover, deleteCover, hasCover, urlToBlob } =
  useCoverStorage()
```

#### 🔍 API 说明

|            方法            |               参数                |         返回值          |         说明         |
| :------------------------: | :-------------------------------: | :---------------------: | :------------------: |
| `saveCover(id, coverBlob)` | `id: string`<br>`coverBlob: Blob` |     `Promise<void>`     | 保存封面至 IndexedDB |
|       `getCover(id)`       |           `id: string`            | `Promise<Blob \| null>` |  获取封面 Blob 数据  |
|     `deleteCover(id)`      |           `id: string`            |     `Promise<void>`     |     删除指定封面     |
|       `hasCover(id)`       |           `id: string`            |   `Promise<boolean>`    |   检查封面是否存在   |
|      `urlToBlob(url)`      |           `url: string`           |     `Promise<Blob>`     | 将图片 URL 转为 Blob |

#### 🔄 响应式状态

- `isLoading`: 当前是否有异步操作正在进行
- `error`: 最近一次错误信息（字符串或 null）

#### 💡 完整使用示例（上传 + 显示）

```
const coverUrl = ref('')
const selectedFile = ref<File | null>(null)

async function saveCoverToStorage() {
  if (selectedFile.value) {
    await saveCover('playlist-1', selectedFile.value)
    if (!error.value) console.log('保存成功')
  }
}

async function loadCoverFromStorage() {
  const blob = await getCover('playlist-1')
  if (blob && !error.value) {
    coverUrl.value = URL.createObjectURL(blob)
  }
}
```

```
<template>
  <input type="file" @change="handleFileChange" accept="image/*" />
  <img v-if="coverUrl" :src="coverUrl" alt="封面" />
  <button @click="loadCoverFromStorage">加载封面</button>
  <button @click="deleteCoverFromStorage">删除封面</button>
  <div v-if="isLoading">正在处理...</div>
  <div v-if="error">错误：{{ error }}</div>
</template>
```

---

## ✅ 总结：关键设计思想

|        模块        |                            设计亮点                             |
| :----------------: | :-------------------------------------------------------------: |
|   `SmartMarquee`   |                **按需渲染**，节省资源，提升性能                 |
|    播放列表系统    | **Pinia + localStorage + IndexedDB** 分层存储，兼顾性能与持久化 |
| `useChineseToggle` |                解耦 UI 交互与业务逻辑，复用性强                 |
| `useCoverStorage`  |                 抽象复杂存储细节，统一接口调用                  |

---

## 四、工具类 Composable 使用指南（续）

### 3. `useAudioPlayer` —— 音频播放控制

#### 📌 功能

处理音频播放的核心逻辑，包括播放/暂停、音频事件处理等。

#### ✅ 导入与初始化

```
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const {
  handleTimeUpdate,
  handlePlay,
  handlePause,
  handleEnded,
  togglePlayPause,
  seekByClick,
  startDrag,
  progressBar,
  isDragging
} = useAudioPlayer()
```

#### 🔍 返回值说明

| 变量/函数          | 类型               | 说明                                                    |
| ------------------ | ------------------ | ------------------------------------------------------- |
| `handleTimeUpdate` | `Function`         | 处理音频时间更新事件                                    |
| `handlePlay`       | `Function`         | 处理音频播放事件                                        |
| `handlePause`      | `Function`         | 处理音频暂停事件                                        |
| `handleEnded`      | `Function`         | 处理音频播放结束事件                                    |
| `togglePlayPause`  | `Function`         | 切换播放/暂停状态                                       |
| `seekByClick`      | `Function`         | 处理点击进度条跳转（来自 useProgressBar）               |
| `startDrag`        | `Function`         | 处理开始拖拽进度条（来自 useProgressBar）               |
| `progressBar`      | `Ref<HTMLElement>` | 进度条元素的引用（来自 useProgressBar）                 |
| `isDragging`       | `Ref<boolean>`     | 表示当前是否正在拖拽进度条的状态（来自 useProgressBar） |

#### 🖼️ 模板使用示例

```
<template>
  <audio
    @timeupdate="handleTimeUpdate"
    @play="handlePlay"
    @pause="handlePause"
    @ended="handleEnded"
  />
  <button @click="togglePlayPause">播放/暂停</button>
  <div
    ref="progressBar"
    @click="seekByClick"
    @mousedown="startDrag"
  >
    <!-- 进度条UI -->
  </div>
</template>
```

---

### 4. `useProgressBar` —— 进度条交互控制

#### 📌 功能

专门处理进度条相关逻辑，包括点击跳转和拖拽功能。

#### ✅ 导入与初始化

```
import { useProgressBar } from '@/composables/useProgressBar'

const { progressBar, isDragging, seekByClick, startDrag } = useProgressBar()
```

#### 🔍 返回值说明

| 变量/函数     | 类型               | 说明                             |
| ------------- | ------------------ | -------------------------------- |
| `progressBar` | `Ref<HTMLElement>` | 进度条元素的引用                 |
| `isDragging`  | `Ref<boolean>`     | 表示当前是否正在拖拽进度条的状态 |
| `seekByClick` | `Function`         | 处理点击进度条跳转功能           |
| `startDrag`   | `Function`         | 处理开始拖拽进度条功能           |

#### 🖼️ 模板使用示例

```
<template>
  <div
    ref="progressBar"
    @click="seekByClick"
    @mousedown="startDrag"
  >
    <!-- 进度条UI -->
  </div>
</template>
```

---

📝 **建议开发规范**

- 所有涉及用户创建的数据（如播放列表）都应做去重校验。
- 图片资源优先使用 Blob URL 或专用存储服务。
- 敏感操作建议添加 loading 和 toast 提示。
