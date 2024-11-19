class Vue {
  activeEffect = () => { };
  #depsMap = Object.create(null);
  constructor (opt) {
    this.el = opt.el instanceof Element ? opt.el : document.querySelector(opt.el) ?? document.createDocumentFragment();
    this.data = new Proxy(opt.data instanceof Function ? opt.data() : opt.data, {
      get: (...args) => [Reflect.get(...args), (this.#depsMap[args[1]] ||= new Set()).add(this.activeEffect)][0],
      set: (...args) => [Reflect.set(...args), this.#depsMap[args[1]].forEach(f => f())][0],
    });
    this.methods = opt.methods;
    (function entry(node, walker, effect) {
      if (node instanceof Element) for (let attr of node.attributes) {
        attr.name[0] === '@' && node.addEventListener(attr.name.slice(1), this.methods[attr.value].bind(this.data));
        attr.name[0] === ':' && effect(() => node.setAttribute(node.__v__ = attr.name.slice(1), node[node.__v__] = this.data[attr.value]));
      }
      if (node instanceof Text && (node.__v_tem__ = node.textContent) && (node.__v__ = Array(...node.__v_tem__.matchAll(/\{\{(.*?)\}\}/g))).length)
        effect(() => node.textContent = node.__v__.reduce((acc, cur) => acc.replace(cur[0], this.data[cur[1].trim()]), node.__v_tem__));
      walker.nextNode() && entry.bind(this)(walker.currentNode, walker, effect);
    }).bind(this)(this.el, document.createTreeWalker(this.el, NodeFilter.SHOW_ALL), fn => (this.activeEffect = fn, fn()));
    Object.keys(opt.watch).forEach(k => this.#depsMap[k].add(() => setTimeout(() => opt.watch[k].bind(this.data)(this.data[k]), 0)));
  }
}