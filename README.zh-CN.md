<p align="right">
  仅供娱乐, <a href="./LearnMore.zh-CN.md">了解更多</a>
</p>

<h1 align="center">vueey</h1>

<p align="center">
  <a href="./README.md">English</a> | <b>简体中文</b>
</p>

最小化的 Vue 实现 **(< 1KB zipped)**

### 🎉 完成的功能

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

### 🎯 使用的示例
- [demon](./examples/demon.html)
- [counter](./examples/counter.html)

### ⌨️ 实现的代码
- [vue.js](./vue.js)
