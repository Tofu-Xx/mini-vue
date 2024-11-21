<p align="right">
  <a href="LearnMore.md">learn more</a>
</p>

<h1 align="center">vueey</h1>

<p align="center">
  <b>English</b> | <a href="./README.zh-CN.md">简体中文</a>
</p>

This project will reproduce as many Vue core features as possible,   
while keeping the size within 1024 bytes.   

### 🎉 achieved

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

### 🎯 use case
- [demon](./examples/demon.html)
- [counter](./examples/counter.html)

### ⌨️ source code
- [vue.js](./vue.js)
