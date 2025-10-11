# Flex 工具 & Light Theme 使用说明

## 目录

- [安装与导入](#安装与导入)
- [Flex 工具概述](#flex-工具概述)
- [通用 flex 容器 `.flex-common()`](#通用-flex-容器-flex-common)
- [行布局 `.row-flex()` / 列布局 `.col-flex()`](#行布局-row-flex--列布局-col-flex)
- [居中快捷 `.flex-center()`](#居中快捷-flex-center)
- [Light Theme 变量](#light-theme-变量)
- [使用示例](#使用示例)
- [注意事项](#注意事项)

------

## 安装与导入

假设项目目录结构如下：

```bash
styles/
│
├─ mixins/
│   └─ _flex.less          // Flex 工具
├─ themes/
│   └─ _light.less         // 亮色主题
└─ variables.less          // 公共变量
```

在入口 Less 文件（如 `main.less`）中导入：

```less
@import "variables.less";
@import "mixins/flex.less";
@import "themes/light.less";
```

------

## Flex 工具概述

提供了通用 flex 容器 mixin，以及行/列/居中快捷 mixin：

|      Mixin       |                    描述                     |
| :--------------: | :-----------------------------------------: |
| `.flex-common()` | 通用 flex 布局，可指定方向、对齐、换行、gap |
|  `.row-flex()`   |                 快捷行布局                  |
|  `.col-flex()`   |                 快捷列布局                  |
| `.flex-center()` |              水平+垂直居中布局              |

------

## 通用 flex 容器 `.flex-common()`

### 参数

|     参数     |    默认值    |                    描述                     |
| :----------: | :----------: | :-----------------------------------------: |
| `@direction` |    `row`     |        flex 方向，`row` 或 `column`         |
|  `@justify`  | `flex-start` |   主轴对齐，如 `center`, `space-between`    |
|   `@align`   |  `stretch`   |     侧轴对齐，如 `center`, `flex-start`     |
|   `@wrap`    |   `nowrap`   |             是否换行，如 `wrap`             |
|    `@gap`    |     `0`      | 子元素间距，单位 `px/rem/em` 等，0 则不输出 |

### 使用示例

```less
.flex-container {
  .flex-common(direction: row, justify: space-between, align: center, wrap: wrap, gap: 16px);
}
```

------

## 行布局 `.row-flex()` / 列布局 `.col-flex()`

### 参数

|    参数    |    默认值    |    描述    |
| :--------: | :----------: | :--------: |
| `@justify` | `flex-start` |  主轴对齐  |
|  `@align`  |  `stretch`   |  侧轴对齐  |
|  `@wrap`   |   `nowrap`   |  换行控制  |
|   `@gap`   |     `0`      | 子元素间距 |

> 支持具名参数调用，顺序可随意：

```less
.row-flex(justify: space-evenly, align: center, gap: 12px);
.col-flex(align: center, gap: 16px, wrap: wrap);
```

------

## 居中快捷 `.flex-center()`

|  参数  | 默认值 |    描述    |
| :----: | :----: | :--------: |
| `@gap` |  `0`   | 子元素间距 |

```less
.flex-center(gap: 10px);
```

------

## Light Theme 变量

|                变量                 |        用途         |
| :---------------------------------: | :-----------------: |
|    `@lightMode-mainPage-bgColor`    |    主页面背景色     |
|      `@lightMode-nav-bgColor`       |     导航栏背景      |
|    `@lightMode-nav-bgItemColor`     |    导航子项背景     |
|     `@lightMode-nav-textColor`      |    导航文字颜色     |
|    `@lightMode-nav-activeColor`     |    导航选中颜色     |
|     `@lightMode-nav-hoverColor`     |   导航 hover 颜色   |
|     `@lightMode-header-bgColor`     |     页头背景色      |
| `@lightMode-music-playingTextColor` |  音乐播放高亮文字   |
|  `@lightMode-music-playingBgColor`  |  音乐播放高亮背景   |
|     `@lightMode-playBar-btnBg`      |    播放按钮背景     |
|   `@lightMode-playBar-btnHoverBg`   | 播放按钮 hover 背景 |
|         `@nav-borderRadius`         |      导航圆角       |

使用示例：

```less
.nav {
  background-color: @lightMode-nav-bgColor;
  border-radius: @nav-borderRadius;
}
```

------

## 使用示例

### 1. 行布局

```less
.header {
  .row-flex(justify: space-between, align: center, gap: 16px);
}
```

### 2. 列布局 + 居中

```less
.sidebar {
  .col-flex(align: center, gap: 12px);
}
```

### 3. 快捷居中

```less
.center-box {
  .flex-center(gap: 10px);
}
```

### 4. 带换行的卡片列表

```less
.gallery {
  .row-flex(wrap: wrap, gap: 20px, justify: space-evenly);
}
```

------

## 注意事项

1. `.flex-common()` 的 `@gap` 为 **非零值才会生效**；
2. `.row-flex()`、`.col-flex()` 支持 **具名参数**，顺序可任意调整；
3. 建议在团队项目中将 **theme、mixins、variables** 分开管理，便于维护和扩展；
4. 如果要支持 **暗色模式**，只需创建 `_dark.less` 并覆盖变量即可。