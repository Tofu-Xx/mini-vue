function Vue(opt) {
  const _ = { deps: Object.create(null) };
  const $el = opt.el instanceof Element ? opt.el : document.querySelector(opt.el) ?? document.createDocumentFragment();
  const that = Object.assign(new Proxy(opt.data instanceof Function ? opt.data() : opt.data, {
    get: (...args) => [Reflect.get(...args), (_.deps[args[1]] ||= new Set()).add(_.active)][0],
    set: (...args) => [Reflect.set(...args), _.deps[args[1]]?.forEach(f => f())][0],
  }), opt.methods, { $el, $refs: {} });
  (function entry(node, walker, effect) {
    if (node instanceof Element) for (let attr of node.attributes) {
      attr.name[0] === '@' && node.addEventListener(attr.name.slice(1), that[attr.value]?.bind(that));
      attr.name[0] === ':' && effect(() => node.setAttribute(attr.__v__ = attr.name.slice(1), node[attr.__v__] = that[attr.value]));
      attr.name === 'ref' && (that.$refs[attr.value] = node);
    }
    if (node instanceof Text && (node.__v_tem__ = node.data) && (node.__v__ = Array(...node.__v_tem__.matchAll(/\{\{(.*?)\}\}/g)))[0])
      effect(() => node.data = node.__v__.reduce((acc, cur) => acc.replace(cur[0], that[cur[1]?.trim()]), node.__v_tem__));
    walker.nextNode() && entry?.bind(that)(walker.currentNode, walker, effect);
  })($el, document.createTreeWalker($el, NodeFilter.SHOW_ALL), fn => (_.active = fn, fn()));
  Object.keys(opt.watch).forEach(k => _.deps[k]?.add(() => Promise.resolve().then(() => opt.watch[k]?.bind(that)(that[k]))));
  opt.mounted?.bind(that)();
};