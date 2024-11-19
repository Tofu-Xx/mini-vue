class Vue {
  static #depsMap = Object.create(null);
  static #activeEffect = null;
  constructor (opt) {
    this.el = opt.el instanceof Element ? opt.el : document.querySelector(opt.el) ?? document.createDocumentFragment();
    this.data = new Proxy(opt.data, {
      get: (...args) => [Reflect.get(...args), (Vue.#depsMap[args[1]] ||= new Set()).add(Vue.#activeEffect)][0],
      set: (...args) => [Reflect.set(...args), Vue.#depsMap[args[1]].forEach((effect) => effect())][0]
    });
    this.methods = opt.methods;
    this.#entry(this.el, document.createTreeWalker(this.el, NodeFilter.SHOW_ELEMENT));
  }
  #entry(node, walker) {
    // [...node.attributes].forEach((attr) => attr.name[0] === "@" ? node.addEventListener(attr.name.slice(1), this.methods[attr.value].bind(this.data)) : attr.name[0] === ":" && this.#effect(() => node.setAttribute(node.__v__ = attr.name.slice(1), node[node.__v__] = this.data[attr.value])));
    for (let attr of node.attributes) {
      // attr.name[0] === "@" && node.addEventListener(attr.name.slice(1), this.methods[attr.value].bind(this.data));
      // attr.name[0] === ":" && this.#effect(() => node.setAttribute(node.__v__ = attr.name.slice(1), node[node.__v__] = this.data[attr.value]));
      switch (attr.name[0]) {
        case "@":
          node.addEventListener(attr.name.slice(1), this.methods[attr.value].bind(this.data));
          break;
        case ":":
          // const name =  attr.name.slice(1);
          this.#effect(() => node.setAttribute(node.__v__ = attr.name.slice(1), node[node.__v__] = this.data[attr.value]));
          break;
      }
    }
    // node.childNodes.forEach((child) => (node.__v__ = child.nodeType === Node.TEXT_NODE && child.textContent) && this.#effect(() => child.textContent = [...node.__v__.matchAll(/\{\{(.*?)\}\}/g)].reduce((acc, cur) => acc.replace(cur[0], this.data[cur[1].trim()]), node.__v__)));
    for (let child of node.childNodes) {
      // (node.__v__ = );
      const tem = child.nodeType === Node.TEXT_NODE && child.textContent;
      /{\{(.*?)\}\}/g.test(tem) && this.#effect(() => child.textContent = [...tem.matchAll(/\{\{(.*?)\}\}/g)].reduce((acc, cur) => acc.replace(cur[0], this.data[cur[1].trim()]), tem));
    }
    walker.nextNode() && this.#entry(walker.currentNode, walker);
  }
  #effect(fn) {
    return (function _effect() {
      Vue.#activeEffect = _effect, fn();
    })();
  }
};
