<p align="right">
  <a href="./LearnMore.zh-CN.md">了解更多</a>
</p>

<h1 align="center">vueey</h1>

<p align="center">
  <a href="./README.md">English</a> | <b>简体中文</b>
</p>

本项目将尽可能多还原出Vue核心功能，
并始终保持打包后的代码体积在 **1024** 字节以内。   

### 🎉 已有 的 功能

```ts
interface Options {
  el?: string 
  data?: object
  methods?: Record<string, Function>
  watch?: Record<string, (val: any, oldVal: any) => void>
  created?: Function
  mounted?: Function
  updated?: Function
}
```

 `{{ }}`
 `:attr=""`
 `@event=""`
 `ref=""`
 `this.$refs`
 `this.$el`

### 🎯 展示 的 用例
- [opt_drill](./examples/opt_drill.html)
- [tem_drill](./examples/tem_drill.html)

### ⌨️ 精彩 的 源码
- [vue.js](./vue.js)
- [vue.min.js](./vue.min.js) *已压缩*

### 🩻 魔鬼 的 版本
**游戏规则：**
**`{`** 和 **`;`** 后必须换行，**`}`** 前必须换行，除非他们在正则表达式中。
目标是使用尽可能少行数。

- [vue.devil.js](./vue.devil.js)
- [vue.undevil.js](./vue.undevil.js) *已展开*