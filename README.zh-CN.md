<p align="right">
  <a href="./LearnMore.zh-CN.md">了解更多</a>
</p>

<h1 align="center">vueey</h1>

<p align="center">
  <a href="./README.md">English</a> | <b>简体中文</b>
</p>

本项目将还原出尽可能多的Vue核心功能，   
并始终保持体积在 **1024** 字节以内。   

### 🎉 完成 的 功能

```ts
interface Options {
  el?: string | Element
  data?: object | Function
  methods?: Record<string, Function>
  watch?: Record<string, (val: any, oldVal: any) => void>
  mounted?: Function
}
```

 `{{ }}`
 `:attr=""`
 `@event=""`
 `ref=""`
 `this.$refs`
 `this.$el`

### 🎯 使用 的 示例
- [demon](./examples/demon.html)
- [counter](./examples/counter.html)

### ⌨️ 实现 的 源码
- [vue.js](./vue.js)

### 🩻 魔鬼 的 版本
**游戏规则：**
- `{`和`;`后必须换行
- `}`前必须换行
- 除非他们在正则表达式中    

- [vue.devil.js](./vue.devil.js)
- [vue.undevil.js](./vue.undevil.js)