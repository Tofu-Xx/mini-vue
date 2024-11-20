<p align="right">
  仅供娱乐
</p>

<h1 align="center">vueey</h1>

<p align="center">
  <a href="./README.md">English</a> | <b>简体中文</b>
</p>

最小化的 Vue 实现 (996 Bytes)

### 🎉 达成目标

##### 选项

```ts
interface Options  {
  el?: string|Element,
  data?: Object|() => Object,
  methods?: Record<string, Function>,
  watch?: Record<string, (val: any, oldVal: any) => void>,
  mounted?: Function,
}
```

##### 其他

:attr, @event, {{ }}, ref, this.$refs, this.$el,

### 🎯 用例
- [demon](./examples/demon.html)
- [counter](./examples/counter.html)
- [ipt-msg](./examples/ipt-msg.html)

### ⌨️ 源码
- [vue.js](./vue.js)
