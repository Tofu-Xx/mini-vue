<p align="right">
  <a href="LearnMore.md">learn more</a>
</p>

<h1 align="center">vueey</h1>

<p align="center">
  <b>English</b> | <a href="./README.zh-CN.md">简体中文</a>
</p>

This project will restore as many Vue core functions as possible.
And always keep the packaged code volume within **1024** bytes.

### 🎉 Achieved Property

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

### 🎯 Use Case
- [demon](./examples/demon.html)
- [counter](./examples/counter.html)

### ⌨️ Source Code
- [vue.js](./vue.js)

### 🩻 Devil Version

**Rules of the game:**
`{` and `;` must be wrapped after, `}` must be wrapped before, unless they are in a regular expression.
The goal is to use as few lines as possible.
   

- [vue.devil.js](./vue.devil.js)
- [vue.undevil.js](./vue.undevil.js)