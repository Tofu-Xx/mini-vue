function reactive(obj: any) {
  const listeners = new Set<Function>()

  const proxy = new Proxy(obj, {
    get(target, property, receiver) {
      if (typeof target[property] === 'object' && target[property] !== null) {
        return reactive(target[property])
      }
      return Reflect.get(target, property, receiver)
    },
    set(target, property, value, receiver) {
      const isSet = Reflect.set(target, property, value, receiver)
      listeners.forEach(fn => fn())
      return isSet
    },
  })

  proxy.track = function (fn: Function) {
    listeners.add(fn)
  }

  return proxy
}

window.Vue = class Vue {
  el: string
  data: any
  methods: any
  template: string
  _activeDom: Array<{ text: Node, tem: string }>
  _bindAttr: Array<Attr>
  constructor(options: any) {
    this.el = options.el
    this.data = reactive(options.data())
    this.methods = options.methods
    this.template = options.template
    this._activeDom = []
    this._bindAttr = []
    this.init()
    this.data.track(this.render.bind(this))
    this.render()
  }

  render() {
    this._activeDom.forEach(({ text, tem }) => {
      (tem.matchAll(/\{\{\s*(\w+)\s*\}\}/g) as any).forEach((m: any) => {
        tem = tem.replace(m[0], this.data[m[1]])
      })
      text.textContent = tem
    })
  }

  init() {
    const el = document.querySelector(this.el)
    if (!el)
      return
    el.innerHTML = this.template ?? el.innerHTML
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT)
    while (walker.nextNode()) {
      const node = walker.currentNode as HTMLElement
      [...(node.attributes as any)].forEach((attr) => {
        if (attr.name.startsWith('@')) {
          node.addEventListener(attr.name.slice(1), this.methods[attr.value].bind(this.data))
        }
        if (attr.name.startsWith(':')) {
          const bindAttr = () => node.setAttribute(attr.name.slice(1), this.data[attr.value])
          this.data.track(bindAttr)
          bindAttr()
        }
      })
      const MustacheTextList = [...(node.childNodes as any)].filter(e => e.nodeType === Node.TEXT_NODE).filter(e => /\{\{\s*\w+\s*\}\}/.test(e.textContent ?? ''))
      MustacheTextList.forEach((text) => {
        this._activeDom.push({ text, tem: text.textContent })
      })
    }
  }
}

interface Window {
  Vue: any
}
