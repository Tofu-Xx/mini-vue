<h1 align="center">vueey</h1>

<p align="center">
  <b>English</b> | <a href="./README.zh-CN.md">简体中文</a>
</p>

This project will restore as many Vue core functions as possible.
And try to keep the packaged code volume within **1024** bytes.

### 🎉 Achieved Property

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

### 🎯 Use Case
- [opt_drill](./examples/opt_drill.html)
- [tem_drill](./examples/tem_drill.html)
- [lifecycle_drill](./examples/lifecycle_drill.html)

### ⌨️ Source Code
- [vue.js](./vue.js)
- [vue.min.js](./vue.min.js) *Compressed*

### 🩻 Devil Version

**Rules of the game:**
**`{`** and **`;`** must be wrapped after, **`}`** must be wrapped before, unless they are in a regular expression.   
The goal is to use as few lines as possible.
<a href="LearnMore.md">learn more</a>

- [vue.devil.js](./vue.devil.js)
- [vue.undevil.js](./vue.undevil.js) *Expanded*