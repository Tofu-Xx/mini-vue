<p align="right">
  For entertainment only, <a href="LearnMore.md">learn more</a>
</p>

<h1 align="center">vueey</h1>

<p align="center">
  <b>English</b> | <a href="./README.zh-CN.md">简体中文</a>
</p>

Minimal Vue implementation **(< 1KB zipped)**

### 🎉 achieved

##### Options

```ts
interface Options {
  el?: string | Element
  data?: object | Function
  methods?: Record<string, Function>
  watch?: Record<string, (val: any, oldVal: any) => void>
  mounted?: Function
}
```

##### Others

 `{{ }}`
 `:attr=""`
 `@event=""`
 `ref=""`
 `this.$refs`
 `this.$el`

### 🎯 use case
- [demon](./examples/demon.html)
- [counter](./examples/counter.html)
- [ipt-msg](./examples/ipt-msg.html)

### ⌨️ source code
- [vue.js](./vue.js)
