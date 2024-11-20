function Vue(opt) {
  const _ = { deps: {} };
  const $el = typeof opt.el == 'string' ? document.querySelector(opt.el) : opt.el ?? document;
  const that = Object.assign(new Proxy(opt.data instanceof Function ? opt.data() : opt.data ?? {}, {
    get: (...args) => [Reflect.get(...args), (_.deps[args[1]] ??= new Set()).add(_.active)][0],
    set: (...args) => [Reflect.set(...args), _.deps[args[1]]?.forEach(f => f())][0],
  }), opt.methods, { $el, $refs: {} });
  (function walk(node, walker, effect) {
    if (node.nodeType == 1) for (let attr of node.attributes) {
      attr.name == 'ref' && (that.$refs[attr.value] = node);
      attr.name[0] == '@' && node.addEventListener(attr.name.slice(1), that[attr.value].bind(that));
      if (attr.name[0] == ':') {
        const name = attr.name.slice(1);
        effect(() => node.setAttribute(name, node[name] = that[attr.value]));
      }
    }
    if (node.nodeType == 3 && (node.__v_tem__ = node.data) && (node.__v__ = Array(...node.__v_tem__.matchAll(/\{\{(.*?)\}\}/g)))[0])
      effect(() => node.data = node.__v__.reduce((acc, cur) => acc.replace(cur[0], that[cur[1].trim()]), node.__v_tem__));
    walker.nextNode() ? walk.bind(that)(walker.currentNode, walker, effect) : opt.mounted?.bind(that)();
  })($el, document.createTreeWalker($el, 4294967295), fn => (_.active = fn, fn()));
  for (const [k, f] of Object.entries(opt.watch ?? {}))
    f.oldVal = that[k], _.deps[k].add(() => Promise.resolve().then(() => (f.val = that[k], f.bind(that)(f.val, f.oldVal), f.oldVal = f.val)));
};